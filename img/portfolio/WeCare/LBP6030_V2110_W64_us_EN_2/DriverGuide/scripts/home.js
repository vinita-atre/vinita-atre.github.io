window.onload = function fncOnLoad() {
	try {

		// resource.jsonのconstantでlang_codeが指定されている場合はドキュメントの言語属性を上書き
		// 例：
		// var constant = [
		// {
		// lang_code:		"zh-CN",
		// :
		var strLangCode = fncGetConstantByName("lang_code");
		if (strLangCode) {
			document.body.lang = strLangCode;
		}

		// ヘッダー項目の生成
		fncIncludeHeader();

		// フッター項目の生成
		fncIncludeFooter();

		// リソースをロード
		fncLoadResource();

		// 動的リンク生成
		fncGenerateDynamicLink();

		// 製品ロゴのチップ表示
		$("img.product_logo").attr("title", fncGetResourceByResourceId("product_name"));

		// スライドショー
		$("div.carousel").carouFredSel(
			{
				auto: {duration: 1000, pauseDuration: 5000, pauseOnHover: true},
				pagination: "#pager",
					circular: false
			}
		);

		// 左側レベル1目次のロード
		fncLoadLevel1();

		// フローティング目次の非表示化
		$("body").click(function() {
//			if ($.browser.msie && parseInt($.browser.version) == 6) {
			$(".level_2").remove();
//			} else {
//				$(".level_2, .level_3, .level_4").css({display: "none"});
//			}
		});

		// ----------------------------------------------------------------------------------------
		// 検索
		// ----------------------------------------------------------------------------------------

		// 検索ボタンにクリックイベントをセット
		document.getElementById("id_search_button").onclick = function() {
			fncSetCookie("SEARCH-RESULT-SETTING", "");
			fncDoSearch(1);
		}
		document.getElementById("id_search_button").title = fncGetResourceByResourceId("search").replace(/<br\/>/g, "");

		// 検索条件を表示・非表示（デフォルト:非表示）
		$("#id_res_search_options_show").click(function() {
			$(this).toggleClass("active");
			$("#id_search_options").toggle();
			fncBounce();
		});

		// すべてのカテゴリーから検索・以下のカテゴリーから検索 (デフォルト:非表示)
		$("#id_search_options_search_scope_all").click(function() {
			fncSelectChaptersFromAll();
		});

		// チャプター一覧 (デフォルト:非表示)
		if (document.getElementById("id_search_chapters")) {

			// チャプター一覧抽出のため目次情報をロード
			// toc.jsonのlevelが「1」のノードは「チャプター」とする
			var t = eval(toc);
			var iLoopLength = t.length;
			for (var i = 0; i < iLoopLength; i++) {

				// チャプター情報を抽出
				if (	(t[i].level == 1)
					&&	(t[i].show_toc != "n")
				) {
					c.push(t[i]);
				}
			}
			var iLoopLength = c.length;
			var arrChapterHtml = new Array();
			for (var i = 0; i < iLoopLength; i++) {
				arrChapterHtml.push(fncGenerateChapterCheckbox(c[i].id, c[i].title));
			}

			// チャプター一覧を配置 (デフォルトは非表示)
			document.getElementById("id_search_chapters").innerHTML = arrChapterHtml.join("");
		}

		// 第2検索ボタン
		if (document.getElementById("id_res_search_button")) {
			document.getElementById("id_res_search_button").onclick = function() {
				fncSetCookie("SEARCH-RESULT-SETTING", "");
				fncDoSearch(1);
			}
			var strSearchButtonTitle = document.getElementById("id_res_search_button").innerText;
			if (!strSearchButtonTitle) {
				strSearchButtonTitle = document.getElementById("id_res_search_button").textContent;
			}
			if (strSearchButtonTitle) {
				document.getElementById("id_res_search_button").title = strSearchButtonTitle;
			}
		}

		// 検索オプション開閉状態の再現
		if (fncGetCookie("SEARCH-OPTIONS") == "OPEN") {
			$("#id_search_options").toggle();
			$("#id_res_search_options_show").toggleClass("active");
		}

		// 検索オプションの再現
		var strSavedSearchOptionScope = fncGetCookie("SEARCH-SCOPE");
		if (strSavedSearchOptionScope == "CHAPTER") {

			document.getElementById("id_search_options_search_scope_chapter").checked = true;

			// 選択チャプターの再現
			var search_chapters = document.getElementById("id_search_chapters");
			if (search_chapters) {
				var strSavedSearchChapters = fncGetCookie("SEARCH-CHAPTERS");
				if (strSavedSearchChapters != "") {
					var objChapterCheckboxes = search_chapters.getElementsByTagName("input");
					for (var i = 0; i < iLoopLength; i++) {
						if (strSavedSearchChapters.indexOf(objChapterCheckboxes[i].id) != -1) {
							objChapterCheckboxes[i].checked = true;
						}
					}
				}
			}

		// デフォルトは「すべて検索」
		} else {
			document.getElementById("id_search_options_search_scope_all").checked = true;
		}

		// 大文字小文字の区別
		if (fncGetCookie("SEARCH-OPTIONS-CASE") == "TRUE") {
			document.getElementById("id_search_options_case").checked = true;
		}

		// ----------------------------------------------------------------------------------------
		// 全角半角の区別
		// ----------------------------------------------------------------------------------------

		// 全角半角区別オプションの表示制御
		var search_option_multibyte = fncGetConstantByName("search_option_multibyte");
		if (search_option_multibyte != 1) {
			document.getElementById("id_search_options_multibyte").parentNode.style.display= "none";
		}

		// 「非表示」の場合は「区別する」
		if (document.getElementById("id_search_options_multibyte").parentNode.style.display.toLowerCase() == "none") {
			document.getElementById("id_search_options_multibyte").checked = true;

		// 明示的に「区別しない」に指定されている場合
		} else if (fncGetCookie("SEARCH-OPTIONS-MULTIBYTE") == "FALSE") {
			document.getElementById("id_search_options_multibyte").checked = true;
		} else {
			document.getElementById("id_search_options_multibyte").checked = false;
		}

		// 検索キーワードの再現
		var strSavedSearchKeyword = fncGetCookie("SEARCH-KEYWORD");
		if (strSavedSearchKeyword) {
			document.getElementById("id_search").value = strSavedSearchKeyword;
		}

		// ----------------------------------------------------------------------------------------
		// 印刷ボタン
		// ----------------------------------------------------------------------------------------
		if (document.getElementById("id_res_bar_icon_print")) {
			document.getElementById("id_res_bar_icon_print").onclick = function() {
				window.print();
			}
//			document.getElementById("id_res_bar_icon_print").onmouseover = function() {
//				this.style.backgroundImage = "Url(\"../frame_images/bar_icon_bg_over.gif?" + Math.random() + "\")";
//			}
//			document.getElementById("id_res_bar_icon_print").onmouseout = function() {
//				this.style.backgroundImage = "None";
//			}
		}

		// ----------------------------------------------------------------------------------------
		// タブの切り換え
		// ----------------------------------------------------------------------------------------
		if (	(document.getElementById("id_res_search"))
			&&	(document.getElementById("id_res_contents"))
		) {

			// 検索
			document.getElementById("id_res_search").onclick = function() {
				fncResSearchClick();
				fncBounce();
			}

			// 目次
			document.getElementById("id_res_contents").onclick = function() {
				fncResContentsClick();
			}
		}

		// トップページにくると必ず もくじタブを選ぶ
		fncSetCookie("TAB-POSITION", "1");

		// ロード完了後に左メニューを表示
		$("div.left").css({visibility: "visible"});

		fncSearchBox();

		fncBounce();

	} catch (e) {
	}
}

function fncLoadLevel1() {
	var ul = document.getElementById("id_chapters");

	// 目次情報をJSONから取得
	var t = eval(toc);
	var tLength = t.length;
	for (var i = 0; i < tLength; i++) {

		// level1階層は左側にアイコンとして配置
		if (t[i].level == 1) {

			var node = t[i];

			// 目次に出力しない場合スキップ
			if (node.show_toc == "n") {
				continue;
			}

			// toc.link_nameに「::」が含まれる場合、
			//「::」から前の文字列は上位グループ名
			//「::」から後の文字列はチャプター名
			var strTocLinkName = node.link_name;
			var strDivMark = "::";
			var nDivPosition = strTocLinkName.indexOf(strDivMark);

			// toc.link_nameからチャプター名を取得
			if (nDivPosition != -1) {
				strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
			}

			// <li>要素の作成
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.innerHTML = node.title;
			if (node.href) {
				a.href = "../contents/" + node.href;
			}
			a.style.backgroundImage = "url(../frame_images/f_chp_btn_" + strTocLinkName + "_0.png)";
			li.appendChild(a);
			li.link_name = strTocLinkName;
			li.toc_id = node.id;
			li.level = node.level;
			li.onmouseover = function() {
				this.style.backgroundImage = "url(../frame_images/f_bg_3.png)";
				this.childNodes[0].style.backgroundImage = "url(../frame_images/f_chp_btn_" + this.link_name + "_1.png)";
				fncShowChildToc(this);
			}
			li.onmouseout = function() {
				this.style.backgroundImage = "url(../frame_images/f_bg_1.png)";
				this.childNodes[0].style.backgroundImage = "url(../frame_images/f_chp_btn_" + this.link_name + "_0.png)";
			}
			ul.appendChild(li);

		}
	}
}
var t = eval(toc);
var tLength = t.length;
function fncShowChildToc(parent) {
	try {
//		window.event.cancelBubble = true;
		$(".level_" + (parent.level + 1)).css({display: "none"});

//		var uls = document.getElementsByTagName("ul");
//		var iLoopLength = uls.length;
//		for (var i = 0; i < iLoopLength; i++) {
//			if (uls[i].className && uls[i].className.indexOf("level_" + (parent.level + 1)) > parent.level + 1) {
//				uls[i].style.display = "none";
//				//alert()
//			}
//		}
//		//$(".level_" + (parent.level + 1)).remove();
//		if (window.event.ctrlKey) {
//			alert(parent.level)
//		}

		if (document.getElementById("id_child_of_" + parent.toc_id)) {

//			var as = document.getElementById("id_child_of_" + parent.toc_id).getElementsByTagName("a");
//			var iLoopLength = as.length;
//			for (var i = 0; i < iLoopLength; i++) {
//				//if (as[i].parentNode.parentNode.style.display.toLowerCase() != "none") {
//					as[i].parentNode.style.display = "block";
//					as[i].style.display = "block";
//					as[i].style.border = "solid 1px red";
//				//}
//			}

			document.getElementById("id_child_of_" + parent.toc_id).style.display = "block";

			// IE6・7・8互換で第四階層まで表示後、第二階層を切り替え、第三階層に触れてから、元の第二階層に戻ると、その奥の第四階層の枠だけが表示される
			if (	($.browser.msie && parseInt($.browser.version) == 6)
				||	($.browser.msie && parseInt($.browser.version) == 7)
			) {
				var uls = document.getElementById("id_child_of_" + parent.toc_id).getElementsByTagName("ul");
				var iLoopLength = uls.length;
				for (var i = 0; i < iLoopLength; i++) {
					if (uls[i].style.display.toLowerCase() == "none") {
						if (uls[i].style.borderColor == "#888888") { 
							uls[i].style.border = "solid "+ parent.level +"px #898989";
						} else {
							uls[i].style.border = "solid "+ parent.level +"px #888888";
						}
					}
				}
			}
//			var uls = document.getElementById("id_child_of_" + parent.toc_id).getElementsByTagName("ul");
//			var iLoopLength = uls.length;
//			if (window.event.ctrlKey) {
//				prompt("",document.getElementById("id_child_of_" + parent.toc_id).outerHTML)
//			}
//			for (var i = 0; i < iLoopLength; i++) {
//				//uls[i].style.display = "none";
//				if (uls[i].level > parent.level + 1) {
//					uls[i].style.display = "none";
//				}
//			}
//			$("#" + "id_child_of_" + parent.toc_id).stop().fadeIn();

		} else {

			var bChildStart = false;
			var parent_level;
			var childs = new Array();

			for (var i = 0; i < tLength; i++) {
				if (t[i].id == parent.toc_id) {
					bChildStart = true;
					parent_level = parseInt(t[i].level);

				// スタート済みで直下の階層ならば収集
				} else if ((bChildStart) && (t[i].level == parent_level + 1)) {
					childs.push(t[i]);

				// スタート済みで親の兄弟階層ならば終了
				} else if ((bChildStart) && (t[i].level == parent_level)) {
					break;

				// スキップ
				} else {
					continue;
				}
			}
			if (childs.length == 0) {
				return;
			}

			// 下階層を作成
			var ul = document.createElement("ul");
			ul.className = "child level_" + (parent_level + 1);
			ul.id = "id_child_of_" + parent.toc_id;
			var iLoopLength = childs.length;
			for (var i = 0; i < iLoopLength; i++) {
				var child = childs[i];

				// 目次に出力しない場合スキップ
				if (child.show_toc == "n") {
					continue;
				}

				var li = document.createElement("li");
				var a = document.createElement("a");
				a.innerHTML = child.title;
				a.title = child.title.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
				if (child.href) {
					a.href = "../contents/" + child.href;
				} else {
					a.style.cursor = "default";
				}
				li.appendChild(a);
				ul.appendChild(li);
				li.toc_id = child.id;
				li.level = child.level;

				if (child.level < 4) {
					li.onmouseover = function() {
						fncShowChildToc(this);
					}
					li.onmouseout = function() {
						//fncHideChildToc("id_child_of_" + this.toc_id);
//						var hide_childs =  this.getElementsByTagName("ul");
//						if (hide_childs && hide_childs[0] && hide_childs[0].style) {
//							//this.getElementsByTagName("ul")[0].style.display = "none";
//							// ここで消すと使い勝手が悪くなる。画面下部でスクロールしようとすると消える
//						}
					}
				}
			}
			var cut = document.createElement("img");
			cut.className = "cut";
			cut.src = "../frame_images/f_cut_" + (parent_level + 1) + ".png";
			ul.appendChild(cut);
			parent.appendChild(ul);
		}
	} catch (e) {
	}
}

function fncHideChildToc(hide_id) {
	try {
		if (document.getElementById(hide_id)) {
			document.getElementById(hide_id).style.display = "none";
			//$("#" + hide_id).stop().fadeIn();
		}
	} catch (e) {
	}
}

function fncResContentsClick() {
	try {

		if ($("#id_res_contents").hasClass("active")) {
			return;
		}

		// タブ選択状態の切り替え
		$("#id_res_search").removeClass("active").addClass("inactive");
		$("#id_res_contents").removeClass("inactive").addClass("active");

		// 表示・非表示の切り替え
		$("#id_chapters").toggle();
		$("#id_panel_search").toggle();
	} catch (e) {
	}
}

function fncResSearchClick() {
	try {

		if ($("#id_res_search").hasClass("active")) {
			return;
		}

		// タブ選択状態の切り替え
		$("#id_res_search").removeClass("inactive").addClass("active");
		$("#id_res_contents").removeClass("active").addClass("inactive");

		// 表示・非表示の切り替え
		$("#id_chapters").toggle();
		$("#id_panel_search").toggle();

		// 検索キーワードテキストボックスを選択状態にする
		//$("#id_search").select();
	} catch (e) {
	}
}

window.onbeforeunload = function fncOnBeforeUnLoad() {
	try {

		// ----------------------------------------------------------------------------------------
		// クッキーに情報を保存
		// ----------------------------------------------------------------------------------------

		// タブ位置の記憶
		var strTabPosition = "0";
		if ($("#id_res_contents").hasClass("active")) {
			strTabPosition = "1";
		} else if ($("#id_res_search").hasClass("active")) {
			strTabPosition = "2";
		}
		fncSetCookie("TAB-POSITION", strTabPosition);

		// 検索キーワードの記憶
		var strSearchKeyword = document.getElementById("id_search").value;
		fncSetCookie("SEARCH-KEYWORD", strSearchKeyword);

		// 検索オプションの記憶
		if (document.getElementById("id_search_options_search_scope_all").checked) {
			fncSetCookie("SEARCH-SCOPE", "ALL");
			fncSetCookie("SEARCH-CHAPTERS", "");
		} else if (document.getElementById("id_search_options_search_scope_chapter").checked) {
			fncSetCookie("SEARCH-SCOPE", "CHAPTER");

			// 検索対象チャプターの記憶
			var objChapterCheckboxes = document.getElementById("id_search_chapters").getElementsByTagName("input");
			var arrSelectedChapters = new Array();
			var iLoopLength = objChapterCheckboxes.length;
			for (var i = 0; i < iLoopLength; i++) {
				if (objChapterCheckboxes[i].checked) {
					arrSelectedChapters.push(objChapterCheckboxes[i].id);
				}
			}
			fncSetCookie("SEARCH-CHAPTERS", arrSelectedChapters.join(","));
		}
		if (document.getElementById("id_search_options_case").checked) {
			fncSetCookie("SEARCH-OPTIONS-CASE", "TRUE");
		} else {
			fncSetCookie("SEARCH-OPTIONS-CASE", "FALSE");
		}

		if (!document.getElementById("id_search_options_multibyte").checked) {
			fncSetCookie("SEARCH-OPTIONS-MULTIBYTE", "TRUE");
		} else {
			fncSetCookie("SEARCH-OPTIONS-MULTIBYTE", "FALSE");
		}

		// 検索オプション開閉状態の記憶
		if (document.getElementById("id_search_options")) {
			if (document.getElementById("id_search_options").style.display.toLowerCase() == "none") {
				fncSetCookie("SEARCH-OPTIONS", "CLOSE");
			} else if (document.getElementById("id_search_options").style.display.toLowerCase() == "block") {
				fncSetCookie("SEARCH-OPTIONS", "OPEN");
			}
		}
	} catch (e) {
	}
}
window.onunload = function() {};
var strWindowType = "HOME";
var c = new Array();