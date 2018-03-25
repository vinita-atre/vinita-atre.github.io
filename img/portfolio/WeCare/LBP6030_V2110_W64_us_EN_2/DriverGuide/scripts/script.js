var c = new Array();
var nPanelSize = 0;
var strDivPrintBottomLeft = "";
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

		// CSS情報
		var objLink = document.getElementsByTagName("link");
		var nLinkLength = objLink.length;
		var strStyleNumber = "";

		// ----------------------------------------------------------------------------------------
		// 別ウィンドウにロードされた場合の処理
		// ----------------------------------------------------------------------------------------
		if (document.location.search.indexOf("?sub=yes") != -1) {

			// 別ウィンドウ用スタイル定義にCSSを切換える
			// NOTE: SF5.1ではalternate stylesheetが正しくロードされない
			for (var i = 0; i < nLinkLength; i++) {
				if (objLink[i].href.indexOf("frame_style.css") != -1) {
					objLink[i].href = "../styles/frame_sub.css";
					break;
				}
			}

			// 以降の処理（リソースのロード、目次生成など）不要
			return;

		// ----------------------------------------------------------------------------------------
		// 第二階層として末端コンテンツを表示
		// ----------------------------------------------------------------------------------------
		} else {

			// index.htmlから起動していない場合、ウィンドウ名を復活させる
			// （お気に入りに登録された場合や、コンテンツHTMLを直接表示させた場合）
			if (window.name == "") {
				window.name = "canon_main_window";
			}

			// 通常のCSSをロード
			for (var i = 0; i < nLinkLength; i++) {
				if (objLink[i].href.indexOf("frame_style.css") != -1) {
					objLink[i].disabled = false;
				}
				if (objLink[i].href.indexOf("frame_sub.css") != -1) {
					objLink[i].disabled = true;
					objLink[i].href = "../styles/frame_style.css"; // NOTE: for ie9
				}

				// スタイル番号を取得
				if (objLink[i].href.indexOf("styles/style") != -1) {

					// NOTE: hrefはIEでは相対パス、その他では絶対パスで取得される
					var arrStyleNumberPath = objLink[i].href.split("/");
					if (arrStyleNumberPath.length > 2) {
						strStyleNumber = arrStyleNumberPath[arrStyleNumberPath.length - 2];
						if (strStyleNumber != "") {
							strStyleNumber += "_";
						}
					}

					// リンクマークをIE6向けにCSSを使用せずに配置するためにstyle_a.pngの所在を確認
					var strStylePath = arrStyleNumberPath[arrStyleNumberPath.length - 3] + "/" + arrStyleNumberPath[arrStyleNumberPath.length - 2] + "/";
				}
			}
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

		// 現在カテゴリーのID
		// TODO: ネームスペースを使用することになった場合、属性「toc_id」は「caesar:toc_id」となる
		var strCurrentChapterId = "";
		if (document.getElementById("id_level_1")) {
			strCurrentChapterId = document.getElementById("id_level_1").getAttribute("toc_id");
			$("#id_chapter_title").text($("#id_level_1").attr("title"));
		}

		// パンくずのIDリスト
		var strBreadCrumbsTocIds = "";
		var strCurrentTocId = ""; // 現在ページのID

		// パンくずをたどり目次ツリーを展開
		var objBreadCrumb = document.getElementById("id_breadcrumbs");
		if (objBreadCrumb) {

			// パンくずの要素分繰り返し
			var iLoopLength = objBreadCrumb.getElementsByTagName("a").length;
			for (var i = 0; i < iLoopLength; i++) {

				// TODO: ネームスペースを使用することになった場合、属性「toc_id」は「caesar:toc_id」となる
				if (objBreadCrumb.getElementsByTagName("a")[i].getAttribute("toc_id")) {
					strBreadCrumbsTocIds += objBreadCrumb.getElementsByTagName("a")[i].getAttribute("toc_id");
					strCurrentTocId = objBreadCrumb.getElementsByTagName("a")[i].getAttribute("toc_id");
				}
			}

			var iLoopLength = objBreadCrumb.childNodes.length;
			for (var i = 0; i < iLoopLength; i++) {
				//if (objBreadCrumb.childNodes[i].nodeValue == " » ") {
				if (objBreadCrumb.childNodes[i].nodeValue && objBreadCrumb.childNodes[i].nodeValue.trim() == "»") {
					var img = document.createElement("img");
					img.src = "../frame_images/f_breadcrumb.png";
					objBreadCrumb.replaceChild(img, objBreadCrumb.childNodes[i]); // NOTE: FFでreplaceNodeは正しく動作しない
				}

				// パンくずリンクホバー時にアンダーライン
				if (objBreadCrumb.childNodes[i].href) {
					objBreadCrumb.childNodes[i].onmouseover = function () {
						this.style.textDecoration = "underline";
					}
					objBreadCrumb.childNodes[i].onmouseout = function () {
						this.style.textDecoration = "none";
					}
				}
			}
		}

		// 現在ページのIDをBODYにセット（検索時にヒット項目が現在ページかどうかを判定するため）
		if (strCurrentTocId != "") {
			document.body.toc_id = strCurrentTocId;
		}

		var iHideLevel = 999;
		var bIsCurrentChapter = false;

		// ----------------------------------------------------------------------------------------
		// 目次描画処理
		// ----------------------------------------------------------------------------------------
		if (document.getElementById("id_toc")) {

			// チャプター冒頭のlevel_1末端コンテンツ（紹介ページ）の表示方法
			// resource.jsonのcoverに定義がない場合は、level_1末端コンテンツはプルダウンには表示する
			// が、その下のツリーには表示しない。定義がある場合は、ツリーにも表示。
			try {
				var v = eval(cover);
				var vLength = v.length;
			} catch (e) {
				var vLength = 0;
			}

			// 目次情報をJSONから取得
			var t = eval(toc);
			var tLength = t.length;
			for (var i = 0; i < tLength; i++) {

				// level1階層は左側にアイコンとして配置
				if (t[i].level == 1) {

					// 目次に出力しない場合スキップ
					if (t[i].show_toc == "n") {
						continue;
					}

					// toc.link_nameに「::」が含まれる場合、
					//「::」から前の文字列は上位グループ名
					//「::」から後の文字列はチャプター名
					var strTocLinkName = t[i].link_name;
					var strDivMark = "::";
					var nDivPosition = strTocLinkName.indexOf(strDivMark);

					// toc.link_nameからチャプター名を取得
					if (nDivPosition != -1) {
						strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
					}

					// <li>要素の作成
					var li = document.createElement("li");
					var button = document.createElement("button");
					//li.id = t[i].id;
					//li.innerHTML = t[i].title;
					button.style.backgroundImage = "url(../frame_images/f_chp_btn_" + strTocLinkName + "_3.png)";
					button.id = "contents/" + t[i].id;
					button.onclick = function() {
						document.location.href = "../" + this.id + ".html";
					}
					button.title = t[i].title;

					// <li>要素を挿入
					document.getElementById("id_chapter_icons").appendChild(li);
					li.appendChild(button);

					// 当該チャプター以外の情報は出力しないようにするための制御
					if (strCurrentChapterId == t[i].id) {
						bIsCurrentChapter = true;

						// 当該チャプターを選択状態にする
						li.className = "selected";
						button.style.backgroundImage = "url(../frame_images/f_chp_btn_" + strTocLinkName + "_4.png)";

//						// 切込み画像
//						var cut = document.createElement("img");
//						cut.src = "../frame_images/f_cut_0.png";
//						cut.className = "cut";
//						li.appendChild(cut);

					} else {
						bIsCurrentChapter = false;
					}

					// 現在のチャプター
					if (bIsCurrentChapter) {
						var strTocLinkName = t[i].link_name;

						// resource.jsonのcoverに現在のチャプター名が存在するかどうかを探索
						for (var j = 0; j < vLength; j++) {

							// toc.link_nameに「::」が含まれる場合、
							//「::」から前の文字列は上位グループ名
							//「::」から後の文字列はチャプター名
							var strDivMark = "::";
							var nDivPosition = strTocLinkName.indexOf(strDivMark);

							// toc.link_nameからチャプター名を取得
							if (nDivPosition != -1) {
								strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
							}

							// チャプター名合致
							if (v[j].cover_name == strTocLinkName) {

								// TOCに要素を追加
								var objLi = document.createElement("li");
								var objSign = document.createElement("img");

								objLi.className = "level_2";

								// 現在表示中のトピック
								if (strCurrentTocId == t[i].id) {
									objSign.src = "../frame_images/toc_sign_0_actv.png";
								} else {
									objSign.src = "../frame_images/toc_sign_0.png";
								}
								objLi.appendChild(objSign);

								// トピックにHTMLが存在する場合、リンク可能に
								if (t[i].href) {

									// HTMLへのリンク要素を作成
									var objAnchor = document.createElement("a");
									objAnchor.href = "../contents/" + t[i].href;
									objAnchor.innerHTML = v[j].cover_title;

									// 現在表示中のトピック
									if (strCurrentTocId == t[i].id) {
										objAnchor.className = "current";
										objAnchor.id = "id_toc_current";
									}

									// 目次項目にHTMLへのリンク要素を挿入（[+][-]の後ろ）
									objLi.appendChild(objAnchor);

									// マウスオーバー時のティップス情報
									objLi.title = v[j].cover_title;

									// 目次項目をドキュメントに挿入
									document.getElementById("id_toc").appendChild(objLi);
								}
								break;
							}
						}
					}

				// チャプター下の目次階層
				} else {

					// 目次に表示しない場合スキップ
					if (t[i].show_toc == "n") {
						continue;
					}

					// 当該チャプターのみ情報を出力（他はスキップ）
					if (bIsCurrentChapter) {

						// level2 - level6
						var objLi = document.createElement("li");
						objLi.className = "level_" + t[i].level;
						if (iHideLevel < t[i].level) {
							objLi.style.display = "none";
						} else {
							iHideLevel = 999;
						}

						// [+][-][ ]
						var objSign = document.createElement("img");

						// 子トピックあり
						if	(	(t[i + 1])
							&&	(t[i + 1].level > t[i].level)
							)
						{

							// [+][-]リンク要素の作成
							var objAnchorSign = document.createElement("a");

							// パンくず上に存在→展開
							if (strBreadCrumbsTocIds.indexOf(t[i].id) != -1) {
								objSign.src = "../frame_images/toc_sign_1.png";

							// 折り畳み表示
							} else {
								objSign.src = "../frame_images/toc_sign_2.png";

								// 現在のレベル以降を非表示にする
								if (iHideLevel == 999) {
									iHideLevel = t[i].level;
								}
							}

							// [+][-]クリック時処理の定義
							objAnchorSign.onclick = fncSwitchTocWrapper;
							objAnchorSign.href = "javascript:void(0);";
							objAnchorSign.className = "sign";

							// [+][-]リンク要素に[+][-]マークを挿入
							objAnchorSign.appendChild(objSign);

							// 目次項目に[+][-]リンク要素を挿入
							objLi.appendChild(objAnchorSign);

						// 子トピックなし
						} else {

							// 現在表示中のトピック
							if (strCurrentTocId == t[i].id) {
								objSign.src = "../frame_images/toc_sign_0_actv.png";
							} else {
								objSign.src = "../frame_images/toc_sign_0.png";
							}
							objLi.appendChild(objSign);
						}

						// トピックにHTMLが存在する場合
						if (t[i].href) {

							// HTMLへのリンク要素を作成
							var objAnchor = document.createElement("a");
							objAnchor.href = "../contents/" + t[i].href;
							objAnchor.innerHTML = t[i].title;

							// 現在表示中のトピック
							if (strCurrentTocId == t[i].id) {
								objAnchor.className = "current";
								objAnchor.id = "id_toc_current";
							}

							// 目次項目にHTMLへのリンク要素を挿入（[+][-]の後ろ）
							objLi.appendChild(objAnchor);

						// 階層だけのノードの場合
						} else {
							var objSpan = document.createElement("span");
							objSpan.innerHTML = t[i].title;
							objLi.appendChild(objSpan);
						}

						// マウスオーバー時のティップス情報
						objLi.title = t[i].title.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

						// 目次項目をドキュメントに挿入
						document.getElementById("id_toc").appendChild(objLi);
					}
				}
			}
		}

		// 前後のトピックのIDを取得
		if (strCurrentTocId != "") {
			var strSiblingTocIds = fncGetSiblingNodeId(strCurrentTocId);
			var strPreviousTocId = strSiblingTocIds.split(":")[0];
			var strNextTocId = strSiblingTocIds.split(":")[1];
		} else {
			var strPreviousTocId = "";
			var strNextTocId = "";
		}

		// ----------------------------------------------------------------------------------------
		// 前トピック
		// ----------------------------------------------------------------------------------------
		if (document.getElementById("id_res_bar_icon_previous")) {

			// 前トピックなし
			if (strPreviousTocId == "") {
				document.getElementById("id_res_bar_icon_previous").disabled = true;
				document.getElementById("id_res_bar_icon_previous").childNodes[0].src = "../frame_images/bar_icon_prev_dis.png";
				document.getElementById("id_res_bar_icon_previous").style.cursor = "default";
				document.getElementById("id_res_bar_icon_previous").childNodes[0].title = "";

			// 前トピックあり
			} else {
				document.getElementById("id_res_bar_icon_previous").onclick = function() {
					document.location.href = "../contents/" + strPreviousTocId + ".html";
				}
			}
		}

		// ----------------------------------------------------------------------------------------
		// 次トピック
		// ----------------------------------------------------------------------------------------
		if (document.getElementById("id_res_bar_icon_next")) {

			// 次トピックなし
			if (strNextTocId == "") {
				document.getElementById("id_res_bar_icon_next").disabled = true;
				document.getElementById("id_res_bar_icon_next").childNodes[0].src = "../frame_images/bar_icon_next_dis.png";
				document.getElementById("id_res_bar_icon_next").style.cursor = "default";
				document.getElementById("id_res_bar_icon_next").childNodes[0].title = "";

			// 次トピックあり
			} else {
				document.getElementById("id_res_bar_icon_next").onclick = function() {
					document.location.href = "../contents/" + strNextTocId + ".html";
				}
			}
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
			}

			// 目次
			document.getElementById("id_res_contents").onclick = function() {
				fncResContentsClick();
			}
		}

		// 印刷のイベント定義
		if (document.getElementById("id_res_print_all")) {
			document.getElementById("id_res_print_all").onclick = function() {

				// チャプター統合目次の場合はすべてのチャプターが印刷対象
				window.open("../contents/print_chapter.html?chapter=" + strCurrentChapterId);
			}
			var strPrintAllTitle = document.getElementById("id_res_print_all").innerText;
			if (!strPrintAllTitle) {
				strPrintAllTitle = document.getElementById("id_res_print_all").textContent;
			}
			if (strPrintAllTitle) {
				document.getElementById("id_res_print_all").title = strPrintAllTitle;
			}
		}

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
		fncSearchBox();

		// タブ選択状態の再現
		if (document.getElementById("id_res_search")) {
			if (fncGetCookie("TAB-POSITION") == "2") {
				if (document.getElementById("id_search").value != fncGetResourceByResourceId("enter_search_keyword")) {

					// 検索結果に表示するページを設定
					var nPage = 1;
					var strSearchResultSetting = fncGetCookie("SEARCH-RESULT-SETTING");
					if ("" != strSearchResultSetting) {
						// 検索結果から選択された場合はCookieから再表示するページ数を取得
						var arrSearchResultSetting = strSearchResultSetting.split(":");
						if ("" != arrSearchResultSetting[0] && undefined != arrSearchResultSetting[0]) {
							nPage = arrSearchResultSetting[0];
						}
					}
					var ti = window.setTimeout("fncDoSearch(" + nPage + ")", 13);
				}
				fncResSearchClick();
			}
		}

		// すべてたたむリンクのイベント定義
		document.getElementById("id_res_close_toc_all").onclick = function() {
			fncOpenCloseAllToc(1);
		}
		var strCloseTocAllTitle = document.getElementById("id_res_close_toc_all").innerText;
		if (!strCloseTocAllTitle) {
			strCloseTocAllTitle = document.getElementById("id_res_close_toc_all").textContent;
		}
		if (strCloseTocAllTitle) {
			document.getElementById("id_res_close_toc_all").title = strCloseTocAllTitle;
		}

		// すべて開くリンクのイベント定義
		document.getElementById("id_res_open_toc_all").onclick = function() {
			fncOpenCloseAllToc(2);
		}
		var strOpenTocAllTitle = document.getElementById("id_res_open_toc_all").innerText;
		if (!strOpenTocAllTitle) {
			strOpenTocAllTitle = document.getElementById("id_res_open_toc_all").textContent;
		}
		if (strOpenTocAllTitle) {
			document.getElementById("id_res_open_toc_all").title = strOpenTocAllTitle;
		}

		// ----------------------------------------------------------------------------------------
		// 本文中の文字列の内、用語集のタイトルと合致するものをハイライト
		// ----------------------------------------------------------------------------------------
		if (	(fncGetConstantByName("markup_glossary") == 1)
			&&	(strWindowType != "HOME")
			&&	(strWindowType != "HOME_TOC")
		) {
			var ti = window.setTimeout("fncDoMarkupGlossary()", 1500);
		}

		// 折り畳み・展開用画像に処理をバインド
		var imgs = document.getElementById("id_content").getElementsByTagName("img");
		var iLoopLength = imgs.length;
		for (var i = 0; i < iLoopLength; i++) {
			var img = imgs[i];
			if (img.src.indexOf("g_ne_toggle") != -1) {
				img.onclick = function() {
					if (this.parentNode.nodeName.toLowerCase() == "span") {
						fncOpenCloseNextSibling(this, jQuery(this.parentNode.parentNode).css("margin-left"));
					} else {
						fncOpenCloseNextSibling(this, jQuery(this.parentNode).css("margin-left"));
					}
				}
				img.style.cursor = "pointer";
			}
		}

		// ----------------------------------------------------------------------------------------
		// 本文レイアウト調整
		// ----------------------------------------------------------------------------------------

		// 折り畳み・展開領域について、非モダンブラウザーでは角丸ドロップシャドウではなく
		// 破線矩形で囲むようにする
		if (!($.support.cssFloat)) {
			$("div.invisible").css({
				backgroundColor: "#fafafa",
				border: "dotted 1px #efefef"
			});
		}

		// IE6・7と互換モードでは、<a>要素のマークをCSSではなく実画像で配置するようにする
		// リンク文字列が2行に渡った場合にマーク位置が崩れることを避けるため
		if ($.browser.msie && parseInt($.browser.version) == 6) {
			$("#id_content a[href!='']").css({background: "none", paddingLeft: 0});
			$("#id_content a[href!='']").prepend("<img class=\"link\" src=\"" + strStylePath + "style_a.png\" />");
		} else if ($.browser.msie && parseInt($.browser.version) == 7) {
			// NOTE: ie7 a[href!=''] does not work
			$("#id_content a:parent").css({background: "none", paddingLeft: 0});
			$("#id_content a:parent").prepend("<img alt=\"\" title=\"\" class=\"link\" src=\"" + strStylePath + "style_a.png\" />");
		}

		// 手順番号縦位置が、ひとつ前の段落のマージン設定によってずれてしまう現象を回避するため、見えないボーダーを引く
		$("div.step_number").wrap("<div class=\"step_number_fixer\"></div>");

		// 手順文内のインライングラフィックによってラインが崩れる現象を回避するため、インライングラフィックを浮遊ラッパーで囲み、ベースラインに影響が出ないようにする
		// ただし、インライングラフィックによって行間が自動的に広がらなくなることになるので、インライングラフィックの高さは28pxに制限することとする
		$("div.step_text img").wrap("<span style='display:inline-block;position:relative;vertical-align:middle;height:1em;overflow:visible;'></span>");

		// IE6で箇条書きマークが印刷されない現象を避けるため、ズーム属性を付与
		// CSS側で設定してしまうと、Web編集時に支障をきたすため、ここで設定
		$("div.list, div.list_level0, div.list_level1, div.list_level2, div.bullet, div.dash, div.h3, div.list_annotation").css({zoom: 1});

		// IE6・7、互換モードでは手順番号が飛び出してしまう現象を避ける
		// また、幅指定がWeb編集時に支障をきたすので、CSSではなくここで設定
		if ($.browser.msie && parseInt($.browser.version) == 6) {
			$("div.step_number").css({position: "Absolute", marginLeft: "-10px", width: "50px", textAlign: "Right", zIndex: 1}); // NOTE: For web edit
			$("div.invisible div.step_number").css({marginLeft: "-20px"}); // NOTE: For web edit
		} else if ($.browser.msie && parseInt($.browser.version) == 7) {

			// ie7
			if (!document.documentMode) {
				//$("div.step_number").before("<div> </div>"); // 手順の前に折りたたみがあると手順番号の横位置が右にずれる問題を回避 →　折りたたみを展開すると数字の縦位置がずれる
				//$("div.step_number").css({position: "Absolute", marginLeft: "-15px", width: "50px", textAlign: "Right", zIndex: 1}); // NOTE: For web edit
				// ie7の場合、Absoluteにすると複数ページ印刷時に手順番号がページ左上に配置されてしまう。
				$("div.step_text").css({marginTop: "-2em"});
				$("div.step_number").css({marginLeft: "5px"});
				$("div.step_number_fixer").css({border: "0"});
				$("div.invisible div.step_number").css({marginLeft: "-15px"}); // NOTE: For web edit

			// 互換モード
			} else {
				$("div.step_number").css({position: "Absolute", marginLeft: "-20px", width: "50px", textAlign: "Right", zIndex: 1}); // NOTE: For web edit
				$("div.invisible div.step_number").css({marginLeft: "-40px"}); // NOTE: For web edit
			}
		} else {
			$("div.step_number").css({position: "Absolute", marginLeft: "-20px", width: "50px", textAlign: "Right", zIndex: 1}); // NOTE: For web edit
			$("div.invisible div.step_number").css({marginLeft: "-40px"}); // NOTE: For web edit
		}

		// 上付き文字の幅指定はWeb編集時に支障をきたすので、CSSではなくここで設定
		if (	($.browser.msie && parseInt($.browser.version) == 6)
		) {
			// NOTE: ie6はinline-block使用できないので対象外とする
		} else {
			$("div.annotation span.superscript").each(function() {

				// 先頭のsuperscriptのみに適用
				if ($(this)[0].parentNode.firstChild === $(this)[0]) {
					$(this).css({width: "1.5em", display: "Inline-Block", textAlign: "Right", marginLeft: "-2px", position: "Relative"});
				}
			});
		}

		// --------------------------------------------------------------------------------------------
		// 左ペインの幅切り替え
		// --------------------------------------------------------------------------------------------

		var iStretch = 234; // 伸縮量

		// 幅を広げる
		$("#id_btn_toggle_l").click(function() {

			nPanelSize++;

			// センター幅をインクリメント
			$("div.center").width($("div.center").width() + iStretch);

			// パネル幅をインクリメント
			$("#id_left").width($("#id_left").width() + iStretch);

			// 最小化状態から1段階広げた時以外
			if ($("#id_left").width() != 270) {

				// パネル内の目次要素も広げる
				$("div.left ul#id_toc").width($("div.left ul#id_toc").width() + iStretch);

				// チャプタータイトルも広げる
				$("div.left div.chapter_title span.chapter_title_center").width($("div.left div.chapter_title span.chapter_title_center").width() + iStretch);

			// 最小化状態から1段階広げた時
			} else {

				nPanelSize = 0;

				// 最小化時に非表示にした要素を再表示
				//$("div.tab, div.open_close, div.left ul#id_toc, div.left ul#id_toc li, div.left div.print").css({display: "block"});
				$("div.tab, div.open_close, div.left ul#id_toc, div.left div.print").css({display: "block"});
				$("div.chapter_title span.chapter_title_left").css({display: "inline"});
				$("div.chapter_title span.chapter_title_center").css({display: "inline"});
				$("#id_btn_toggle_s").css({display: "inline-block"});
				$("#id_left").css({overflow: "visible"});
				//$("div.left ul#id_toc").width(231);
				$("div.left ul#id_toc").width(232);
				// 最小化時に加工した枠線を元に戻す
				$("div.left div.chapter_title").css({borderRadius: "0", borderTop: "0", borderLeft: "0"});

				// 広げるボタンの位置を元に戻す
				//$("div.left div.chapter_title button#id_btn_toggle_l").css({right: "0"});
				$("span.chapter_title_right").width(48);

				// プロダクトロゴを再表示
				$("img.product_logo").show();
			}

			// チャプタータイトルを垂直中央に揃える
			$("#id_chapter_title").css({marginTop: (40 / 2) - ($("#id_chapter_title").height() / 2)});

			fncStrechToc();
		});

		// 幅を縮める
		$("#id_btn_toggle_s").click(function() {

			// すでに最小化状態となっている場合は、ウィンドウサイズを縮めてもそれ以上処理しない
			if ($("div.tab").css("display") == "none") {
				return;
			}

			nPanelSize--;

			// パネル幅をデクリメント
			$("#id_left").width($("#id_left").width() - iStretch);

			$("#id_left").css({overflow: "hidden"});

			// センター幅をデクリメント
			$("div.center").width($("div.center").width() - iStretch);

			// 目次幅をデクリメント
			$("div.left ul#id_toc").width($("div.left ul#id_toc").width() - iStretch);

			// チャプタータイトルをデクリメント
			$("div.left div.chapter_title span.chapter_title_center").width($("div.left div.chapter_title span.chapter_title_center").width() - iStretch);

			// 最小幅に到達
			if ($("#id_left").width() <= 36) {

				nPanelSize = -1;

				// 非表示処理
				//$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, ul#id_toc li, div.left div.print, #id_btn_toggle_s").css({display: "none"});
				$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, div.left div.print, #id_btn_toggle_s").css({display: "none"});

				// 枠線加工
				$("div.left div.chapter_title").css({borderRadius: "5px 5px 0 0", borderTop: "0", borderLeft: "0"});

				// 広げるボタン位置を中央に寄せる
				//$("div.left div.chapter_title button#id_btn_toggle_l").css({right: "5px"});
				$("span.chapter_title_right").width(36);

				// 検索タブだった場合は目次タブに切り替える
				fncResContentsClick();

				// プロダクトロゴを隠す
				$("img.product_logo").hide();
			}

			// チャプタータイトルを垂直中央に揃える
			$("#id_chapter_title").css({marginTop: (40 / 2) - ($("#id_chapter_title").height() / 2)});
		});

		// 左ペインのサイズ再現
		if (fncGetCookie("TAB-POSITION") != "2") { // 検索タブ選択時はデフォルトに戻す
			if (fncGetCookie("LEFT_PANEL_SIZE") == -1) {

				// 最小化
				$("#id_left").width(36);
				$("#id_left").css({overflow: "hidden"});
				$("div.center").width(706);
				$("div.left ul#id_toc").width(36);
				//$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, ul#id_toc li, div.left div.print, #id_btn_toggle_s").css({display: "none"});
				$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, div.left div.print, #id_btn_toggle_s").css({display: "none"});
				$("div.left div.chapter_title").css({borderRadius: "5px 5px 0 0", borderTop: "0", borderLeft: "0"});
				//$("div.left div.chapter_title button#id_btn_toggle_l").css({right: "5px"});
				$("span.chapter_title_right").width(36);

				// プロダクトロゴを隠す
				$("img.product_logo").hide();
				nPanelSize = -1;

			} else {
				for (var i = 0; i < fncGetCookie("LEFT_PANEL_SIZE"); i++) {
					$("#id_btn_toggle_l").click();
				}
			}
		}

		// ----------------------------------------------------------------------------------------
		// トップに戻るボタンの処理バインディング
		// ----------------------------------------------------------------------------------------
		//var offsetBackTotheTop = $("#back_to_the_top").offset(); // NOTE: ie6で初期ロードでタブ位置がずれる（.offset()実行時）
		var offsetBackTotheTop = 80;
		var topPaddingBackTotheTop = 80;
		$(window).scroll(function() {
			if ($(window).scrollTop() > offsetBackTotheTop) {
				$("#back_to_the_top").stop().css({
					marginTop: $(window).scrollTop() - offsetBackTotheTop + topPaddingBackTotheTop
				}, 100);
			} else {
				$("#back_to_the_top").stop().css({
					marginTop: 0
				});
			}
		});

		var strLinkToTop = "";
		var ltt = eval(link_to_top_title);
		if (!strLangCode) {
			strLangCode = document.getElementsByTagName('html')[0].attributes["xml:lang"].value;
		}
		var iLoopLength = 0;
		iLoopLength = ltt.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (ltt[i].lang == strLangCode) {
				strLinkToTop = ltt[i].title;
				break;
			}
			if (ltt[i].lang == "default") {
				strLinkToTop = ltt[i].title;
			}
		}
		$("#back_to_the_top img").attr("title", strLinkToTop);

		// チャプタータイトルを垂直中央に揃える
		$("#id_chapter_title").css({marginTop: (40 / 2) - ($("#id_chapter_title").height() / 2)});
		$(".chapter_title_left").html("&nbsp;");

		// h2内の折り畳み展開ボタンを垂直中央に揃える
		$("div.h2 img").each(function() {
			$(this).css("display", "none");
			$(this).css({"position": "absolute", "top": ($(this).parent().outerHeight() / 2) - (20 / 2)});
			$(this).css("display", "inline");
		});

		// ロード完了後に左メニューを表示
		$("div.left").css({visibility: "visible"});
		fncAdjustColumnHeight();

		// ie8互換モードでh2のアンカーにhoverが誤反応しリンクマークが表示されてしまう問題を回避
		var as = document.getElementsByTagName("a");
		var iLoopLength = as.length;
		for (var i = 0; i < iLoopLength; i++) {
			var a = as[i];
			if (a.innerHTML == "") {
				a.className += " anchor";
			}
		}

		// ----------------------------------------------------------------------------------------
		// 検索結果からジャンプしてきた場合、ヒット文字列をハイライトさせる
		// ----------------------------------------------------------------------------------------
		// NOTE: 本文レイアウト調整の前に実行すると、FFでスクロール位置がずれる現象が発生する
		if (document.location.search) {
			if (strWindowType != "HOME") {
				var ti = window.setTimeout("fncMarkupSearch()", 26);
			}
		} else {

			// IE6やFFの場合リンクアンカーまでスクロールしないので、自前でアンカー位置にスクロール
			if (document.location.hash != "") {
				var strHash = document.location.hash.substring(1);
				if (document.getElementById(strHash)) {
					document.getElementById(strHash).scrollIntoView(true);
				}
			}
		}
		$("a.current").parent().css({backgroundColor:"#555"});

// NOTE: ウィンドウ高さに収まる状況があまりなく、追従するとき・しないときのルールがユーザー
//       にとって認知されない可能性が高いので機能を無効化
//		// ----------------------------------------------------------------------------------------
//		// 左ペインのスクロール追従処理
//		// ----------------------------------------------------------------------------------------
//		var offsetLeft = 100;//$("div.left").offset();
//		var topPaddingLeft = 100;
//		$(window).scroll(function() {
//
//			// ウィンドウ高さに左ペインが収まる場合のみ実行
//			if ($(window).height() < $("div.left").height()) {
//				return;
//			}
//			if ($(window).scrollTop() > offsetLeft) {
//				$("div.left").stop().animate({
//					marginTop: $(window).scrollTop() - offsetLeft + topPaddingLeft
//				}, 100);
//			} else {
//				$("div.left").stop().animate({
//					marginTop: 0
//				});
//			}
//		});
	} catch (e) {
	}
}

// 折り畳み・展開処理
function fncOpenCloseNextSibling(img, iOffsetLeft) {
	try {

		// スイッチ画像のパスを取得
		var strSrcPath = "../frame_images/";

		// スイッチ画像から段落タグに遡る
		var target = img;
		while ((target.nodeName.toLowerCase() != "div") || ($(target).hasClass("figure"))) {
			target = target.parentNode;
		}

		// 段落タグから次の非表示要素まで移動
		while (!$(target).hasClass("invisible")) {
			target = target.nextSibling;
		}

		// 非表示要素を検出
		if ($(target).hasClass("invisible")) {

			// 左位置情報を引数から取得
			target.style.marginLeft = iOffsetLeft;

			// IE678では処理を簡略化
			if (	($.browser.msie && parseInt($.browser.version) == 6)
				||	($.browser.msie && parseInt($.browser.version) == 7)
				||	($.browser.msie && parseInt($.browser.version) == 8)
			) {
				if (img.src.indexOf("g_ne_toggle_open") != -1) {
					img.src = strSrcPath + "g_ne_toggle_close.gif";
					jQuery(target).css({display: "block"});
				} else if (img.src.indexOf("g_ne_toggle_close") != -1) {
					img.src = strSrcPath + "g_ne_toggle_open.gif";
					jQuery(target).css({display: "none"});
				} else if (img.src.indexOf("g_ne_toggle_en_open") != -1) {
					img.src = strSrcPath + "g_ne_toggle_en_close.png";
					jQuery(target).css({display: "block"});
				} else if (img.src.indexOf("g_ne_toggle_en_close") != -1) {
					img.src = strSrcPath + "g_ne_toggle_en_open.png";
					jQuery(target).css({display: "none"});
				}
				fncAdjustColumnHeight();
				// ie6で上付き文字が折り畳み展開直後だけ位置が崩れてしまう現象を防ぐ
				if ($.browser.msie && parseInt($.browser.version) == 6) {
					$("span.superscript").css({left: "0"});
				}
			} else {
				// jQueryによるアニメーション効果とスイッチ画像の切り替え
				jQuery(target).slideToggle(500, fncAdjustColumnHeight);
				if (img.src.indexOf("g_ne_toggle_open") != -1) {
					img.src = strSrcPath + "g_ne_toggle_close.gif";
				} else if (img.src.indexOf("g_ne_toggle_close") != -1) {
					img.src = strSrcPath + "g_ne_toggle_open.gif";
				} else if (img.src.indexOf("g_ne_toggle_en_open") != -1) {
					img.src = strSrcPath + "g_ne_toggle_en_close.png";
				} else if (img.src.indexOf("g_ne_toggle_en_close") != -1) {
					img.src = strSrcPath + "g_ne_toggle_en_open.png";
				}
			}

			// 開閉後に「トップに戻る」タブの縦位置がずれることを防ぐ
			var offsetBackTotheTop = 80;
			var topPaddingBackTotheTop = 80;
			if ($(window).scrollTop() > offsetBackTotheTop) {
				$("#back_to_the_top").stop().css({
					marginTop: $(window).scrollTop() - offsetBackTotheTop + topPaddingBackTotheTop
				}, 100);
			} else {
				$("#back_to_the_top").stop().css({
					marginTop: 0
				});
			}
		}
	} catch (e) {
	}
}
function fncAdjustColumnHeight() {
	fncStrechToc();
	fncBounce();
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
		$("#id_panel_toc").toggle();
		$("#id_panel_search").toggle();
		//$("#id_btn_toggle_l, #id_btn_toggle_s").toggle();

		fncAdjustColumnHeight();

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
		$("#id_panel_toc").toggle();
		$("#id_panel_search").toggle();
		//$("#id_btn_toggle_l, #id_btn_toggle_s").toggle();

		// 検索キーワードテキストボックスを選択状態にする
		//$("#id_search").select();

		fncAdjustColumnHeight();

	} catch (e) {
	}
}

function fncDoMarkupGlossary() {
	try {
		var arrGlossaryIndex = fncCreateGlossaryIndex();
		var strLangCode = document.getElementsByTagName('html')[0].attributes["xml:lang"].value;
		var nMode = 0;
		if (strLangCode.match(/ja|zh|ko/)) {
			nMode = 1;
		}
		fncMarkupGlossary(document.getElementById("id_content"), arrGlossaryIndex, nMode);
	} catch (e) {
	}
}

function fncMarkupSearch() {
	try {

		// 検索条件を引数から取得
		var strSearchText = document.location.search.split("?search=")[1];

		strSearchText = strSearchText.split("&word=yes")[0];

		// トップページから検索した時の検索説明ページはハイライトさせない
		if (strSearchText.indexOf("&marking=no") != -1) {
			return;
		} else {
			strSearchText = strSearchText.split("&marking=")[0];
		}
		if (strSearchText != "") {

			// 検索条件文字列をデコード
			strSearchText = decodeURIComponent(strSearchText);

			// 前後のスペースを除去しておく
			// NOTE: IEとそれ以外のブラウザーで、前後にスペースがあるかどうかでsplitの結果が変わる（IEの場合、空の要素は省かれる）
			strSearchText = strSearchText.trim();

			if (strSearchText == fncGetResourceByResourceId("enter_search_keyword")) {
				return;
			}

			// NOTE: ここでエスケープすると2重処理

			// 複数検索条件を分解（全半角スペース）
			var res = /[\s　]+/;
			var arrSearchText = strSearchText.split(res);

			// NOTE: Safari3でキーワード前後に全角スペースがあると、配列に空の要素が作成されバーストが発生
			var iLoopLength = arrSearchText.length;
			for (var i = 0; i < iLoopLength; i++) {
				if (arrSearchText[i] == "") {
					arrSearchText.splice(i, 1);
				}
			}

			// 完全一致検索のためにダブルクォーテーションで囲まれた文字列内のスペース代替文字を復元
			var iLoopLength = arrSearchText.length;
			for (var i = 0; i < iLoopLength; i++) {
				arrSearchText[i] = arrSearchText[i].replace(/___SPACE___/g, " ");
			}

			// マルチバイトの区別
			if (document.getElementById("id_search_options_multibyte")) {
				if (!document.getElementById("id_search_options_multibyte").checked) {
					for (var i = 0; i < iLoopLength; i++) {
						arrSearchText[i] = fncConvertSearchText(arrSearchText[i], false);
					}
				}
			}

			// 大文字小文字の区別
			var strSearchOptionCaseSensitive = "i"; // 正規表現のフラグ「i」→区別あり
			if (fncGetCookie("SEARCH-OPTIONS-CASE") == "TRUE") {
				strSearchOptionCaseSensitive = "";
			}

			// 用語の検索結果から表示する場合、単語単位でハイライトする
			var bWordMarking = false;
			if (document.location.search.indexOf("&word=yes") != -1) {
				bWordMarking = true;
			}

			// コンテンツ領域内のテキスト要素をハイライト
			fncMarkupText(
				document.getElementById("id_content"),
				arrSearchText,
				strSearchOptionCaseSensitive,
				bWordMarking
			);

			// 折りたたみをすべて展開
			fncOpenCloseAll("open");
			fncAdjustColumnHeight(); // 展開後の状態でカラム高さを再調整

// スクロールすると検索結果が見づらくなってしまうので仕様変更
//			// 最初にヒットした文字列までスクロール
//			if (document.getElementById("id_hit")) {
//				document.getElementById("id_hit").scrollIntoView(true);
//			}
		}
	} catch (e) {
	}
}

var glossary;
// ------------------------------------------------------------------------------------------------
// 用語集のタイトル部分だけを配列化
// ------------------------------------------------------------------------------------------------
function fncCreateGlossaryIndex() {
	try {

		// ----------------------------------------------------------------------------------------
		// 用語集 (glossary.json) の取得
		// ----------------------------------------------------------------------------------------
		if (!glossary) {
			glossary = $.ajax({url:"../jsons/glossary.json", async:false}).responseText;
		}

		// NOTE: var glossary = [{...}];
		//                      ^^^^^^^ (v.2以降では動的にjsonをロードするため[～]部分だけが必要)
		var g = eval(glossary.substring(15, glossary.length - 1));
		var iLoopLength = g.length;
		var arrGlossaryIndex = new Array();
		for (var i = 0; i < iLoopLength; i++) {
			var jLoopLength = g[i].words.length;
			for (var j = 0; j < jLoopLength; j++) {
				arrGlossaryIndex.push(g[i].words[j].word);
			}
		}
		return arrGlossaryIndex;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 本文中のハイライトされた用語集にマウスオーバーしたときにツールチップで用語説明を表示
// ------------------------------------------------------------------------------------------------
function fncGlossaryToolTip(target) {
	try {

		var strGlossaryWordName = target.innerHTML; // NOTE: innerTextはDOM非標準

		// NOTE: var glossary = [{...}];
		//                      ^^^^^^^ (v.2では動的にjsonをロードするため[～]部分だけが必要)
		var g = eval(glossary.substring(15, glossary.length - 1));
		var iLoopLength = g.length;
		var arrGlossaryDesc = new Array();
		for (var i = 0; i < iLoopLength; i++) {
			var jLoopLength = g[i].words.length;
			for (var j = 0; j < jLoopLength; j++) {
				if (strGlossaryWordName == g[i].words[j].word) {
					target.title = g[i].words[j].desc.replace(/<br\/>/g, "\r\n").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
					return;
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 用語集マークアップ
// ------------------------------------------------------------------------------------------------
function fncMarkupGlossary(element, arrGlossaryIndex, nMode) {
	try {

		// 子ノード数分繰り返し
		var iLoopLength = element.childNodes.length;
		for (var i = 0; i < iLoopLength; i++) {
			var child = element.childNodes[i];

			// タイトル部分は対象外
			if ((child.className) && (child.className.match(/h[1-6]/) != null)) {
				continue;
			}

			// パンくず部分は対象外
			if (child.id == "id_breadcrumbs") {
				continue;
			}

			// #textまでたどり着いたらマークアップ処理
			if (child.nodeType == 3) { // #text

				var strNodeValue = child.nodeValue;

				// NOTE: Safariにおいて検索画面からジャンプした際に表レイアウトが崩れる現象を回避
				// トリムした結果文字列が残らない場合はマーキング処理を実行しない
				var strNodeValueTemp = strNodeValue.replace(/\t| |\n/g, "");
				if (strNodeValueTemp == "") {
					continue;
				}

				// マーキング対象の有無
				var bIsMarkedup = false;

				// 用語集タイトル分ループ
				var jLoopLength = arrGlossaryIndex.length;
				for (var j = 0; j < jLoopLength; j++) {

					var bSearchAsWord = true;

					// 用語集タイトルの取り出し
					var strGlossaryWord = arrGlossaryIndex[j];

					// 用語集タイトルをエスケープ
					var regexpEscapeJson = /([()])/g;
					if (regexpEscapeJson.exec(strGlossaryWord) != null) {
						strGlossaryWord = strGlossaryWord.replace(regexpEscapeJson, "\\$1");

						// 括弧が含まれている場合は単語検索しない
						bSearchAsWord = false;
					}

					// マルチバイト言語の場合は単語検索しない
					if (nMode == 1) {
						bSearchAsWord = false;
					}

					// 合致するかどうかを判定
					if (bSearchAsWord) {
						var re = new RegExp("\\b(" + strGlossaryWord + ")\\b", ""); // 単語レベルで合致しているかどうか
					} else {
						var re = new RegExp("(" + strGlossaryWord + ")", "");
					}
					if (re.exec(strNodeValue) != null) {

						// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
						// またマーキング用のタグ文字列と部分合致するキーワードが検索された場合にマーキング用タグまで文字列置換されてしまうことを防ぐ
						// マーキング開始タグ:	⁅(U+2045(Left Square Bracket With Quill))
						// マーキング終了タグ:	⁆(U+2046(Right Square Bracket With Quill))
						//strNodeValue = strNodeValue.replace(re, "⁅$1⁆");
						strNodeValue = strNodeValue.replace(re, function($1, $2, $3) {
							return  String.fromCharCode(0x2045) + $1.replace(/ /g, "___CAESAR___") + String.fromCharCode(0x2046); // NOTE: 用語集マーキングのネストを避けるため、用語集文字列内のスペースを一旦置換（\\bによりヒットしなくなる）
						});

						bIsMarkedup = true;

						// ページ内ではじめに見つけた箇所だけにマークアップ
						arrGlossaryIndex[j] = "___DONE___";
					}
				}
				if (bIsMarkedup) {

					// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
					strNodeValue = strNodeValue.replace(/</g, "&lt;");
					strNodeValue = strNodeValue.replace(/>/g, "&gt;");
					strNodeValue = strNodeValue.replace(/___CAESAR___/g, " ");

					// マーキングタグを復元
					if (child.parentNode.nodeName.toLowerCase() == "a") {
						strNodeValue = strNodeValue.replace(/\u2045/g, "<span class=\"glossary\" onmouseover=\"fncGlossaryToolTip(this);\">");
						strNodeValue = strNodeValue.replace(/\u2046/g, "</span>");
					} else {
						strNodeValue = strNodeValue.replace(/\u2045/g, "<a href=\"javascript:void(0);\" onclick=\"fncOpenGlossary(this.innerHTML);\" class=\"glossary\" onmouseover=\"fncGlossaryToolTip(this);\">");
						strNodeValue = strNodeValue.replace(/\u2046/g, "</a>");
					}

					// マーキング済みの文字列に差し替え
					var newNode = document.createElement("span");

					// NOTE:innerHTMLとすることでトリムが発生してしまう。結果先頭がスペースの#textは、単語の間のスペースが詰まってしまう
					if (strNodeValue.substring(0, 1) == " ") {
						newNode.innerHTML = "&nbsp;" + strNodeValue.substring(1);
					} else {
						newNode.innerHTML = strNodeValue;
					}
					element.replaceChild(newNode, child);
				}
			// <div><span><a>はさらに子ノードを処理
			} else {
				fncMarkupGlossary(child, arrGlossaryIndex, nMode);
			}
		}
	} catch (e) {
	}
}
function fncOpenGlossary(word) {
	try {
		var iWidth = 640;
		var iHeight = 480;
		var iLeft = (screen.width / 2) - (iWidth / 2);
		var iTop = (screen.height / 2) - (iHeight / 2);
		var wnd = window.open(
			"../frame_htmls/glossary.html?word=" + encodeURIComponent(word),
			"canon_sub_window",
			"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=" + iTop + ",left=" + iLeft + ",height=" + iHeight
		);
		wnd.focus();
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 本文中の検索キーワードと合致する文字列をハイライトする
// ------------------------------------------------------------------------------------------------
function fncMarkupText(element, arrSearchText, strSearchOptionCaseSensitive, bWordMarking) {
	try {

		// 子ノード数分繰り返し
		var nElementChildLength = element.childNodes.length;
		for (var i = 0; i < nElementChildLength; i++) {
			var child = element.childNodes[i];

			// パンくず部分は対象外
			if (child.id == "id_breadcrumbs") {
				continue;
			}

			// #textまでたどり着いたらマークアップ処理
			if (child.nodeType == 3) { // #text

				var strNodeValue = child.nodeValue;

				// NOTE: Safariにおいて検索画面からジャンプした際に表レイアウトが崩れる現象を回避
				// トリムした結果文字列が残らない場合はマーキング処理を実行しない
				var strNodeValueTemp = strNodeValue.replace(/\t| |\n/g, "");
				if (strNodeValueTemp == "") {
					continue;
				}

				// マーキング対象の有無
				var bIsMarkedup = false;

				// 各検索条件文字列にマーキング
				// 10種類のカラーバリエーションを循環
				var nMarkerColor = 0;
				var nSearchTextLength = arrSearchText.length;
				for (var j = 0; j < nSearchTextLength; j++) {

					// 1桁数字を検索した場合にカラーバリエーションクラス名まで文字列置換されてしまうことを防ぐ
					// 0-9の代わりにU+2080(Subscript Zero)-U+2089(Subscript Nine)を使用する
					switch (nMarkerColor) {
						case 0:
							strMarkerColor = String.fromCharCode(0x2080); // "₀";
							break;
						case 1:
							strMarkerColor = String.fromCharCode(0x2081); // "₁";
							break;
						case 2:
							strMarkerColor = String.fromCharCode(0x2082); // "₂";
							break;
						case 3:
							strMarkerColor = String.fromCharCode(0x2083); // "₃";
							break;
						case 4:
							strMarkerColor = String.fromCharCode(0x2084); // "₄";
							break;
						case 5:
							strMarkerColor = String.fromCharCode(0x2085); // "₅";
							break;
						case 6:
							strMarkerColor = String.fromCharCode(0x2086); // "₆";
							break;
						case 7:
							strMarkerColor = String.fromCharCode(0x2087); // "₇";
							break;
						case 8:
							strMarkerColor = String.fromCharCode(0x2088); // "₈";
							break;
						case 9:
							strMarkerColor = String.fromCharCode(0x2089); // "₉";
							break;
					}

					// キーワードの取り出し
					var strSearchText = arrSearchText[j];

					// キーワードに合致するかどうかを判定
					var strSearchTextParam = "(" + strSearchText + ")";
					if (bWordMarking) {
						// 単語単位で検索された文字列をマーキング
						strSearchTextParam = "\\b(" + strSearchText + ")\\b";
					}
					var re = new RegExp(strSearchTextParam, "g" + strSearchOptionCaseSensitive);

					if (re.exec(strNodeValue) != null) {

						// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
						// またマーキング用のタグ文字列と部分合致するキーワードが検索された場合にマーキング用タグまで文字列置換されてしまうことを防ぐ
						// マーキング開始タグの開始:	⁅(U+2045(Left Square Bracket With Quill))
						// マーキング開始タグの終了:	⁆(U+2046(Right Square Bracket With Quill))
						// マーキング終了タグ:			₎(U+208E(Subscript Right Parenthesis))
						//var strNodeValue = strNodeValue.replace(re, "⁅" + strMarkerColor + "⁆$1₎");
						var strNodeValue = strNodeValue.replace(re, String.fromCharCode(0x2045) + strMarkerColor + String.fromCharCode(0x2046) + "$1" + String.fromCharCode(0x208E));
						bIsMarkedup = true;
					}
					nMarkerColor++;
					if (nMarkerColor >= 10) {
						nMarkerColor = 0;
					}
				}
				if (bIsMarkedup) {

					// テキスト値に<～>で囲まれた文字列が含まれると、innerHTMLで戻すときにタグとして認識され、囲まれた文字列が表示されなくなってしまう現象を回避
					strNodeValue = strNodeValue.replace(/</g, "&lt;");
					strNodeValue = strNodeValue.replace(/>/g, "&gt;");

					// マーキングタグを復元
					strNodeValue = strNodeValue.replace(/\u2045/g, "<span id=\"id_hit\" class=\"hit hit_"); // ⁅
					strNodeValue = strNodeValue.replace(/\u2046/g, "\">"); // ⁆
					strNodeValue = strNodeValue.replace(/\u2080/g, "0"); // ₀
					strNodeValue = strNodeValue.replace(/\u2081/g, "1"); // ₁
					strNodeValue = strNodeValue.replace(/\u2082/g, "2"); // ₂
					strNodeValue = strNodeValue.replace(/\u2083/g, "3"); // ₃
					strNodeValue = strNodeValue.replace(/\u2084/g, "4"); // ₄
					strNodeValue = strNodeValue.replace(/\u2085/g, "5"); // ₅
					strNodeValue = strNodeValue.replace(/\u2086/g, "6"); // ₆
					strNodeValue = strNodeValue.replace(/\u2087/g, "7"); // ₇
					strNodeValue = strNodeValue.replace(/\u2088/g, "8"); // ₈
					strNodeValue = strNodeValue.replace(/\u2089/g, "9"); // ₉
					strNodeValue = strNodeValue.replace(/\u208E/g, "</span>"); // ₎

					// マーキング済みの文字列に差し替え
					var newNode = document.createElement("span");
					newNode.innerHTML = strNodeValue;
					element.replaceChild(newNode, child);
				}

			// <div><span><a>はさらに子ノードを処理
			} else {
				fncMarkupText(child, arrSearchText, strSearchOptionCaseSensitive, bWordMarking);
			}
		}
	} catch (e) {
	}
}

// 各ペインをウィンドウサイズに合わせてサイズ調整
window.onresize = fncOnResize;
var nPreviousWindowWidth;
function fncOnResize() {
	try {

		// ウィンドウサイズの取得
//		var w = fncGetWindowWidth();
//		var h = fncGetWindowHeight();
		var w = $(window).width();
		var h = $(window).height();

		// メインウィンドウ
		if (document.location.search.indexOf("?sub=yes") == -1) {

			if (!nPreviousWindowWidth) {
				nPreviousWindowWidth = w;
			}

			// ウィンドウサイズが広がった
			if (nPreviousWindowWidth < w) {

				// 800ピクセル以上に広がった
				if (w >= 800) {

					// 現在最小化状態にある
					if ($("div.tab").css("display") == "none") {

						// 最小化解除
						$("#id_btn_toggle_l").click();
						//$("div.left ul#id_toc").width(231);
						$("div.left ul#id_toc").width(232);
						$("span.chapter_title_center").width(174);
						$("#id_chapter_title").css({marginTop: (40 / 2) - ($("#id_chapter_title").height() / 2)});

						// プロダクトロゴを再表示
						$("img.product_logo").show();
					}
				}

			// ウィンドウサイズが縮まった
			} else if (nPreviousWindowWidth > w) {

				// 800ピクセルよりも狭くなった
				if (w < 800) {

					nPanelSize = -1;

					$("#id_left").width(36);
					$("#id_left").css({overflow: "hidden"});
					$("div.center").width(706);
					$("div.left ul#id_toc").width(36);
					//$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, ul#id_toc li, div.left div.print, #id_btn_toggle_s").css({display: "none"});
					$("div.tab, div.open_close, div.chapter_title span.chapter_title_left, span.chapter_title_center, div.left ul#id_toc, div.left div.print, #id_btn_toggle_s").css({display: "none"});
					$("div.left div.chapter_title").css({borderRadius: "5px 5px 0 0", borderTop: "solid 1px #333", borderLeft: "solid 1px #333"});
					//$("div.left div.chapter_title button#id_btn_toggle_l").css({right: "5px"});
					$("span.chapter_title_right").width(36);

					// 検索タブだった場合は目次タブに切り替える
					fncResContentsClick();

					// チャプタータイトルを垂直中央に揃える
					$("#id_chapter_title").css({marginTop: (40 / 2) - ($("#id_chapter_title").height() / 2)});

					// プロダクトロゴを隠す
					$("img.product_logo").hide();
				}
			}

		// 別ウィンドウ
		} else {
		}
		nPreviousWindowWidth = w;
	} catch (e) {
	}
}

// カテゴリー目次[+][-]開閉処理
function fncSwitchTocWrapper() {
	fncSwitchToc(this);
	fncStrechToc();
}
function fncSwitchToc(eSrc) {
	try {

		var iTargetLevel = 999; // 初期値
		var strDisplay = "";

		// [-] -> [+]
		if (eSrc.childNodes[0].src.lastIndexOf("toc_sign_1") != -1) {
			eSrc.childNodes[0].src = "../frame_images/toc_sign_2.png";
			strDisplay = "None";

		// [+] -> [-]
		} else if(eSrc.childNodes[0].src.lastIndexOf("toc_sign_2") != -1) {
			eSrc.childNodes[0].src = "../frame_images/toc_sign_1.png";
			strDisplay = "Block";
		}

		// 目次項目ループ
		var objLis = document.getElementById("id_toc").childNodes;
		var nLiLength = objLis.length;
		for (var i = 0; i < nLiLength; i++) {

			if (objLis[i].nodeType != 1) {
				continue;
			}

			// 表示切替開始位置を探索
			if (document.getElementById("id_toc").childNodes[i] === eSrc.parentNode) {

				// 処理対象レベルを取得（クリックされた[+][-]がh2ならば、表示切替対象はh3）
				iTargetLevel = parseInt(eSrc.parentNode.className.substring(6)) + 1;
				continue;
			}

			// [-] -> [+]がクリックされた場合、下階層すべてを非表示にする
			if (strDisplay == "None") {

				if (parseInt(objLis[i].className.substring(6)) >= iTargetLevel) {

					// 表示を切り替え
					objLis[i].style.display = strDisplay;

					// [-][+] -> [+]
					if (objLis[i].childNodes[0].nodeName.toLowerCase() == "a") {
						objLis[i].childNodes[0].childNodes[0].src = "../frame_images/toc_sign_2.png";
					}
				} else {
					if (iTargetLevel != 999) {
						break;
					}
					continue;
				}

			// [+] -> [-]がクリックされた場合、下階層のみを表示する
			} else {
				if (parseInt(objLis[i].className.substring(6)) == iTargetLevel) {

					// 表示を切り替え
					objLis[i].style.display = strDisplay;
					continue;
				} else {
					if (	(iTargetLevel != 999)
						&&	(iTargetLevel > parseInt(objLis[i].className.substring(6)))
					) {
						break;
					}
					continue;
				}
			}
		}
	} catch (e) {
	}
}

// カテゴリー目次一括開閉処理
function fncOpenCloseAllToc(nMethod) {
	try {
		var objSign = document.getElementById("id_toc").getElementsByTagName("img");
		var nSignLength = objSign.length;
		for (var i = 0; i < nSignLength; i++) {
			if (objSign[i].src.lastIndexOf("toc_sign_" + nMethod + ".png") != -1) {
				if (document.all) {
					objSign[i].click();
				} else {
					fncSwitchToc(objSign[i].parentNode);
				}
			}
		}
		fncStrechToc();
	} catch (e) {
	}
}

// 詳細一括開閉処理
function fncOpenCloseAll(strMethod) {
	try {
//		$("div.invisible").toggle();
		var imgs = document.getElementById("id_content").getElementsByTagName("img");
		var iLoopLength = imgs.length;
		for (var i = 0; i < iLoopLength; i++) {
			var img = imgs[i];
			if (img.src.indexOf("g_ne_toggle") != -1) {
//				if (img.src.indexOf("g_ne_toggle_open.gif") != -1) {
//					img.src = "../frame_images/g_ne_toggle_close.gif";
//				}
				if (img.parentNode.nodeName.toLowerCase() == "span") {
					fncOpenCloseNextSibling(img, jQuery(img.parentNode.parentNode).css("margin-left"));
				} else {
					fncOpenCloseNextSibling(img, jQuery(img.parentNode).css("margin-left"));
				}
			}
		}
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

		// 左パネルの表示・非表示状態の記憶
		fncSetCookie("LEFT_PANEL_SIZE", nPanelSize);

	} catch (e) {
	}
}
var strWindowType = "MAIN";

function fncStrechToc() {
	try {
		var nGap = 0;

		// 初回スタブを作成
		if ($("li#stub").size() == 0) {
			var objStub = document.createElement("li");
			objStub.id = "stub";
			$("#id_toc").append(objStub);
		}

		// スタブの初期スタイル設定
		$("li#stub").css({
			height: 0,
			display: "none"
		});

		// チャプターアイコン列と目次列の高さの差を割り出す
		nGap = $("#id_chapter_icons").height() - ($("#id_toc").height() + 10);

		// チャプターアイコン列の方が高い場合
		if (nGap > 0) {

			// 目次スタブの高さを補完
			$("li#stub").css({
				height: nGap + "px",
				display: ""
			});

		// 目次列の方が高い場合
		} else {

			// 目次スタブの高さをゼロに設定
			$("li#stub").css({
				height: 0,
				display: "none"
			});
		}
		//$("#id_left").css({background: "#c1c2c3"});

		// コンテンツと左ペインの高さを比較
		nGap = $("#id_right").height() - ($("#id_res_contents").height() + $(".chapter_title").height() + $("#id_panel_toc").height());

		// コンテンツの方が高い場合
		if (nGap > 0) {

			// 一旦スタブをリセットして再計算
			$("li#stub").css({
				height: 0,
				display: "none"
			});
			nGap = $("#id_right").height() - ($("#id_res_contents").height() + $(".chapter_title").height() + $(".open_close").height() + $(".print").height() + $("#id_toc").height());

			// 目次スタブの高さを補完
			$("li#stub").css({
				height: nGap + "px",
				display: ""
			});
		}
	} catch (e) {
	}
}
