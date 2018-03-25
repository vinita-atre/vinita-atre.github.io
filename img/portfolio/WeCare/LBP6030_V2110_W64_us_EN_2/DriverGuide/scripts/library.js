function fncSearchKeyDown(nKeyCode, strValue) {
	try{

		// NOTE: IEでは、buttonのtypeがsubmitにより、下記がなくても[Enter]で検索可能
		// NOTE: IE9では、input内[Enter]によるonclickイベントが発生する要素が不安定につきsubmit属性に頼らない
		if (nKeyCode == 13) {
			document.getElementById("id_search_button").click();
			return false;
		}
		if (strValue == fncGetResourceByResourceId("enter_search_keyword")) {
			if (document.getElementById("id_search")) {
				document.getElementById("id_search").value = "";
				document.getElementById("id_search").style.color = "#000000";
			} else if (document.getElementById("id_search_texts")) {
				document.getElementById("id_search_texts").value = "";
				document.getElementById("id_search_texts").style.color = "#000000";
			}
		}
		return true;
	} catch (e) {
	}
}
function fncOpenSubWindow(strUrl, strTarget) {
	try {

		// 外部URLを新しいウィンドウで開く
		if (strTarget == "_blank") {
			var wnd = window.open(
				strUrl,
				strTarget
			);

		// 活用集用ウィンドウ
		} else if (strTarget == "theme") {
			var iWidth = 1024;
			var iHeight = 768;
			var iLeft = (screen.width / 2) - (iWidth / 2);
			var iTop = (screen.height / 2) - (iHeight / 2);
			var wnd = window.open(
				strUrl,
				strTarget,
				"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=" + iTop + ",left=" + iLeft + ",height=" + iHeight + ",scrollbars=yes"
			);

		// 画面中央にサブウィンドウを開きトピックを表示
		} else {
			var iWidth = 640;
			var iHeight = 480;
			var iLeft = (screen.width / 2) - (iWidth / 2);
			var iTop = (screen.height / 2) - (iHeight / 2);
			var wnd = window.open(
				strUrl + "?sub=yes",
				strTarget,
				"directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes,width=" + iWidth + ",top=" + iTop + ",left=" + iLeft + ",height=" + iHeight + ",scrollbars=yes"
			);
		}
		wnd.focus();
	} catch (e) {
	}
}
function fncPrint() {
	try {

		// ブラウザーの印刷ダイアログを呼び出す
		window.print();
	} catch(e) {
	}
}
function fncKeyPress() {
	try {

		// [Esc]キー押下時のイベント
		// NOTE: FF/SFでは機能しない
		if (event.keyCode == 27) {

			// ウィンドウを閉じる
			window.close();
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リンク名を元にtoc.jsonのhrefをたどる
// ------------------------------------------------------------------------------------------------
function fncGetTocHrefByLinkName(link_name) {
	try {

		// toc.jsonをロード
		var t = eval(toc);
		var nTLength = t.length;
		for (var i = 0; i < nTLength; i++) {

			// toc.link_name（旧仕様ではtoc.type）を取得
			var strTocLinkName;
			if (t[i].link_name) {
				strTocLinkName = t[i].link_name;
				if (strTocLinkName == "") {
					continue;
				}
			} else if (t[i].type) {
				strTocLinkName = t[i].type;
				if (strTocLinkName == "") {
					continue;
				}
			} else {
				continue;
			}

			// toc.link_nameに「::」が含まれる場合、
			//「::」から前の文字列は上位グループ名
			//「::」から後の文字列はカテゴリー名
			var strDivMark = "::";
			var nDivPosition = strTocLinkName.indexOf(strDivMark);

			// toc.link_nameからカテゴリー名を取得
			if (nDivPosition != -1) {
				strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
			}

			// toc.link_nameと要求するlink_nameが合致した場合は、toc.hrefを返す
			if (strTocLinkName == link_name) {
				return "../contents/" + t[i].href;
			}
		}
		return false;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リンク名を元にtoc.jsonのidをたどる
// ------------------------------------------------------------------------------------------------
function fncGetTocIdByLinkName(link_name) {
	try {

		// toc.jsonをロード
		var t = eval(toc);

		// リンク名が指定されていない場合は先頭ノードのIDを返す
		if (!link_name) {
			return t[0].id;
		}
		var nTLength = t.length;
		for (var i = 0; i < nTLength; i++) {

			// toc.link_name（旧仕様ではtoc.type）を取得
			var strTocLinkName;
			if (t[i].link_name) {
				strTocLinkName = t[i].link_name;
				if (strTocLinkName == "") {
					continue;
				}
			} else if (t[i].type) {
				strTocLinkName = t[i].type;
				if (strTocLinkName == "") {
					continue;
				}
			} else {
				continue;
			}

			// toc.link_nameに「::」が含まれる場合、
			//「::」から前の文字列は上位グループ名
			//「::」から後の文字列はカテゴリー名
			var strDivMark = "::";
			var nDivPosition = strTocLinkName.indexOf(strDivMark);

			// toc.link_nameからカテゴリー名を取得
			if (nDivPosition != -1) {
				strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
			}

			// toc.link_nameと要求するlink_nameが合致した場合は、toc.hrefを返す
			if (strTocLinkName == link_name) {
				return t[i].id;
			}
		}
		return false;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リンク名を元にtoc.jsonのノード情報を返す
// ------------------------------------------------------------------------------------------------
function fncGetTocNodeByLinkName(link_name) {
	try {

		// toc.jsonをロード
		var t = eval(toc);
		var nTLength = t.length;
		for (var i = 0; i < nTLength; i++) {

			var strTocLinkName;
			if (t[i].link_name) {
				strTocLinkName = t[i].link_name;
				if (strTocLinkName == "") {
					continue;
				}
			} else {
				continue;
			}

			// toc.link_nameに「::」が含まれる場合、
			//「::」から前の文字列は上位グループ名
			//「::」から後の文字列はカテゴリー名
			var strDivMark = "::";
			var nDivPosition = strTocLinkName.indexOf(strDivMark);

			// toc.link_nameからカテゴリー名を取得
			if (nDivPosition != -1) {
				strTocLinkName = strTocLinkName.substring(nDivPosition + strDivMark.length);
			}

			// toc.link_nameと要求するlink_nameが合致した場合は、ノード情報を返す
			if (strTocLinkName == link_name) {
				return t[i];
			}
		}
		return false;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 指定したノードの両となりのノードIDを取得
// ------------------------------------------------------------------------------------------------
function fncGetSiblingNodeId(toc_id) {
	try {
		var t = eval(toc);
		var iLoopLength = t.length;
		var strReturn = ":";

		// TOC構造の先頭から現在地を探索
		for (var i = 0; i < iLoopLength; i++) {

			// 現在地
			if (t[i].id == toc_id) {

				// 1つ前のノードを探索
				var ii = i;
				while (ii > 0) {
					if (	(t[ii - 1])
						&&	(t[ii - 1].show_toc != "n")
					) {
						strReturn = t[ii - 1].id + strReturn;
						break;
					}
					ii--;
				}

				// 1つ次のノードを探索
				var ii = i;
				while (ii <= iLoopLength) {
					if (	(t[ii + 1])
						&&	(t[ii + 1].show_toc != "n")
					) {
						strReturn += t[ii + 1].id;
						break;
					}
					ii++;
				}
				break;
			}
		}
		return strReturn;
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リソースIDを元に値を取得
// ------------------------------------------------------------------------------------------------
function fncGetResourceByResourceId(resource_id) {
	try {
		var r = eval(resource);
		var nRLength = r.length;
		for (var i = 0; i < nRLength; i++) {

			if (r[i].id == resource_id) {
				return r[i].value;
			}
		}
		return "";
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// JSON定義を元にヘッダー項目を表示する
// ------------------------------------------------------------------------------------------------
function fncIncludeHeader() {
	try {
		if (header) {
			var arrHtml = new Array();
			var arrHeader = header.split(",");
			var nHeaderLength = arrHeader.length;
			for (var i = 0; i < nHeaderLength; i++) {
				switch (arrHeader[i]) {
					case "|" :
						break;
					case "_SEARCH_" :
						// noop
						break;
					case "print" :
						arrHtml.push("<li><span id=\"id_res_bar_icon_print\"></span>");
						break;
					default :
						arrHtml.push("<li><a id=\"id_link_" + arrHeader[i] + "\"></a></li>");
						break;
				}
			}
			document.getElementById("id_header_include").innerHTML = arrHtml.join("");
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// JSON定義を元にフッター項目を表示する
// ------------------------------------------------------------------------------------------------
function fncIncludeFooter() {
	try {
		if (footer) {
			var arrHtml = new Array();
			var arrFooter = footer.split(",");
			var nFooterLength = arrFooter.length;
			for (var i = 0; i < nFooterLength; i++) {
				switch (arrFooter[i]) {
					case "|" :
						break;
					case "_PUBNO_" :
						arrHtml.push("<li><span id=\"id_res_pub_number\"></span></li>");
						break;
					default :
						arrHtml.push("<li><a id=\"id_link_" + arrFooter[i] + "\"></a></li>");
						break;
				}
			}
			document.getElementById("id_footer_include").innerHTML = arrHtml.join("");
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// リソース定義をロードしてHTML内の対応する要素に値を代入する
// ------------------------------------------------------------------------------------------------
function fncLoadResource() {
	try {

		var r = eval(resource);
		var nRLength = r.length;
		for (var i = 0; i < nRLength; i++) {

			// リソースIDに合致するbody側要素を発見した時は、内容をリソースの値に書き換える
			if (document.getElementById("id_res_" + r[i].id)) {
				document.getElementById("id_res_" + r[i].id).innerHTML = r[i].value;
			}

			// <title>タグの内容をロード
			if (document.title == "") {
				if (r[i].id == "title") {
					document.title = r[i].value;
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 動的リンク処理
// ------------------------------------------------------------------------------------------------
function fncGenerateDynamicLink(window_target) {
	try {

		// ----------------------------------------------------------------------------------------
		// リンクマッピング定義のロード
		// ----------------------------------------------------------------------------------------
		var l = eval(link);
		var nLLength = l.length;
		for (var i = 0; i < nLLength; i++) {

			var link_name = l[i].link_name;
			var link_target = l[i].link_target;
			var link_resource = l[i].link_resource;
			if (!link_resource) {
				link_resource = link_name;
			}
			if (window_target != undefined) {
				link_target = window_target;
			}

			// link_nameに合致するbody側要素がある場合
			var objLinkItem = document.getElementById("id_link_" + link_name);
			if (objLinkItem) {

				// リンク先を取得
				var link_href = fncGetTocHrefByLinkName(link_name);

				// toc.jsonから取得できなかった場合は、link.json内のhrefを採用
				// 末端コンテンツ以外にジャンプさせる場合はlink.json内にて記述
				if (!link_href) {
					link_href = l[i].link_href;
				}
				objLinkItem.link_href = link_href;

				// タグ種類によって振る舞いを変える
				var strNodeName = objLinkItem.nodeName.toLowerCase();

				// <a>
				if (strNodeName == "a") {

					// <a>[resource]</a>
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.innerHTML = strInnerHTML;
						objLinkItem.title = strInnerHTML;
					}

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						// <a href="[link_href]" class="self">[resource]</a>
						objLinkItem.href = link_href;
						objLinkItem.className = "self";

					// 親ウィンドウにリンク先を表示
					} else if (link_target == "canon_main_window") {

						// <a href="[link_href]" class="canon_main_window">xxxxx</a>
						objLinkItem.href = link_href;
						objLinkItem.target = link_target;

					// 別ウィンドウにリンク先を表示
					} else {

						// <a href="#" onclick="fncOpenSubWindow();" class="[link_target]">[resource]</a>
						//objLinkItem.href = "#";
						objLinkItem.href = "javascript:void(0);";
						objLinkItem.link_target = link_target;
						if (link_target == "canon_sub_window") {
							objLinkItem.className = "sub_window";
						}
						objLinkItem.onclick = function() {
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}

				// <button>
				} else if (strNodeName == "button") {

					// <button title="[resource]"></button>
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.title = strInnerHTML;
					}

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						// <button onclick="fncOpenSubWindow();"></button>
						objLinkItem.onclick = function(){
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						// <button onclick="fncOpenSubWindow();"></button>
						objLinkItem.link_target = link_target;
						objLinkItem.onclick = function(){
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}

					if (!objLinkItem.childNodes[0]) {

						// ボタン内の通常画像
						objLinkItem.innerHTML = "<img src=\"../frame_images/" + link_name + "_out.png\" />";
						objLinkItem.link_name = link_name;

						// イベント定義
						objLinkItem.onmouseover = function() {
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_over.png";
						};
						objLinkItem.onmouseout = function() {
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_out.png";
						};
					}

				// <img>
				} else if (strNodeName == "img") {

					// <img title="[resource]" />
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objLinkItem.title = strInnerHTML;
					}

					objLinkItem.style.cursor = "Pointer";

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						objLinkItem.onclick = function() {
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						objLinkItem.link_target = link_target;
						objLinkItem.onclick = function() {
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}
				}
			}

			// ヘッダーフッターにあるリンク要素と同じリンク先をトップページ内に配置させるための対応
			var objButtonItem = document.getElementById("id_button_" + link_name);
			if (objButtonItem) {

				// リンク先を取得
				var link_href = fncGetTocHrefByLinkName(link_name);

				// toc.jsonから取得できなかった場合は、link.json内のhrefを採用
				// 末端コンテンツ以外にジャンプさせる場合はlink.json内にて記述
				if (!link_href) {
					link_href = l[i].link_href;
				}
				objButtonItem.link_href = link_href;

				// タグ種類によって振る舞いを変える
				var strNodeName = objButtonItem.nodeName.toLowerCase();

				// <button>
				if (strNodeName == "button") {

					// <button title="[resource]"></button>
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objButtonItem.title = strInnerHTML;
					}

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						// <button onclick="fncOpenSubWindow();"></button>
						objButtonItem.onclick = function(){
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						// <button onclick="fncOpenSubWindow();"></button>
						objButtonItem.link_target = link_target;
						objButtonItem.onclick = function(){
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}

					if (!objButtonItem.childNodes[0]) {

						// ボタン内の通常画像
						objButtonItem.innerHTML = "<img src=\"../frame_images/" + link_name + "_out.png\" />";
						objButtonItem.link_name = link_name;

						// イベント定義
						objButtonItem.onmouseover = function() {
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_over.png";
						};
						objButtonItem.onmouseout = function() {
							this.childNodes[0].src = "../frame_images/" + this.link_name + "_out.png";
						};
					}

				// <img>
				} else if (strNodeName == "img") {

					// <img title="[resource]" />
					var strInnerHTML = fncGetResourceByResourceId(link_resource);
					if (strInnerHTML) {
						objButtonItem.title = strInnerHTML;
					}

					objButtonItem.src = "../frame_images/" + link_name + "_out.png";
					objButtonItem.link_name = link_name;

					// イベント定義
					objButtonItem.onmouseover = function() {
						this.src = "../frame_images/" + this.link_name + "_over.png";
					};
					objButtonItem.onmouseout = function() {
						this.src = "../frame_images/" + this.link_name + "_out.png";
					};

					objButtonItem.style.cursor = "Pointer";

					// 自ウィンドウ内にリンク先を表示
					if (link_target == "_self") {

						objButtonItem.onclick = function() {
							document.location.href = this.link_href;
						}

					// 別ウィンドウにリンク先を表示
					} else {

						objButtonItem.link_target = link_target;
						objButtonItem.onclick = function() {
							fncOpenSubWindow(this.link_href, this.link_target);
						}
					}
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// ウィンドウリサイズ時のフレーム要素のサイズ調整
// ------------------------------------------------------------------------------------------------
//function fncResizeFrame() {
//	try {
//		var obj = window;
//		var w = fncGetWindowWidth();
//		var h = fncGetWindowHeight();
//
//		if (document.getElementById("id_body")) {
//			document.getElementById("id_body").style.height = h - 70 + "px";
//			document.getElementById("id_body").style.width = w + "px";
//		}
//		if (document.getElementById("id_footer")) {
//			document.getElementById("id_footer").style.top = h - 26 + "px";
//			document.getElementById("id_footer").style.width = w + "px";
//		}
//	} catch (e) {
//	}
//}

// ------------------------------------------------------------------------------------------------
// 検索条件入力欄の動作定義
// ------------------------------------------------------------------------------------------------
function fncSearchBox() {
	try {

		// 検索条件入力欄の初期表示
		if (document.getElementById("id_search")) {
			if (document.getElementById("id_search").value == "") {
				document.getElementById("id_search").value = fncGetResourceByResourceId("enter_search_keyword");
				document.getElementById("id_search").style.color = "#808080";
			}

			if (document.getElementById("id_search").value == fncGetResourceByResourceId("enter_search_keyword")) {
				document.getElementById("id_search").style.color = "#808080";
			}

			// クリック時に初期表示のメッセージを隠す
			document.getElementById("id_search").onclick = function() {
				if (this.value == fncGetResourceByResourceId("enter_search_keyword")) {
					this.value = "";
					document.getElementById("id_search").style.color = "#000000";
				}
			}

			// 検索条件が入力されていない場合は初期表示に戻す
			document.getElementById("id_search").onblur = function() {
				if (this.value == "") {
					this.value = fncGetResourceByResourceId("enter_search_keyword");
					document.getElementById("id_search").style.color = "#808080";
				}
			}
			var strLangCode = document.getElementsByTagName('html')[0].attributes["xml:lang"].value;
			document.getElementById("id_search").lang = strLangCode;
		} else if (document.getElementById("id_search_texts")) {
			if (document.getElementById("id_search_texts").value == "") {
				document.getElementById("id_search_texts").value = fncGetResourceByResourceId("enter_search_keyword");
				document.getElementById("id_search_texts").style.color = "#808080";
			}

			if (document.getElementById("id_search_texts").value == fncGetResourceByResourceId("enter_search_keyword")) {
				document.getElementById("id_search_texts").style.color = "#808080";
			}

			// クリック時に初期表示のメッセージを隠す
			document.getElementById("id_search_texts").onclick = function() {
				if (this.value == fncGetResourceByResourceId("enter_search_keyword")) {
					this.value = "";
					document.getElementById("id_search_texts").style.color = "#000000";
				}
			}

			// 検索条件が入力されていない場合は初期表示に戻す
			document.getElementById("id_search_texts").onblur = function() {
				if (this.value == "") {
					this.value = fncGetResourceByResourceId("enter_search_keyword");
					document.getElementById("id_search_texts").style.color = "#808080";
				}
			}
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// テキスト全文検索エンジン
// ------------------------------------------------------------------------------------------------
var search;
function fncDoSearch(nPage) {
	try {

		var strLangCode = document.getElementsByTagName('html')[0].attributes["xml:lang"].value;

		// ----------------------------------------------------------------------------------------
		// 検索条件の取得
		// ----------------------------------------------------------------------------------------

		// 入力された検索条件を取得
		var strSearchTexts = document.getElementById("id_search").value;

		// 前後のスペースを除去しておく
		// NOTE: IEとそれ以外のブラウザーで、前後にスペースがあるかどうかでsplitの結果が変わる（IEの場合、空の要素は省かれる）
		strSearchTexts = strSearchTexts.trim();

		// 検索条件表示用にJSONエスケープしない状態も残しておく（HTMLエスケープは必要）
		var strSearchTextsOriginal = strSearchTexts;

		// 検索条件が指定されていない場合は実行しない
		if (	(strSearchTexts == "")
			||	(strSearchTexts == fncGetResourceByResourceId("enter_search_keyword"))
		) {
			document.getElementById("id_search").value = fncGetResourceByResourceId("enter_search_keyword");
			document.getElementById("id_search").style.color = "#808080";

//			// 検索初期表示にリセット
//			if (	(document.getElementById("id_search_results"))
//				&&	(document.getElementById("id_search_results").innerHTML.indexOf(fncGetResourceByResourceId("search_message_wait")) != -1)
//			) {
//				fncResetSearchDisplay();
//			}
			return false;
		}

		// 検索条件をエスケープ
		var regexpEscapeJson = /([$()\-^\\\|\[\]{},:+*.?])/g;
		if (regexpEscapeJson.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeJson, "\\$1");
		}
		var regexpEscapeHtmlAmp = /(&)/g;
		if (regexpEscapeHtmlAmp.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlAmp, "&amp;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlAmp, "&amp;");
		}
		var regexpEscapeHtmlLt = /(<)/g;
		if (regexpEscapeHtmlLt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlLt, "&lt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlLt, "&lt;");
		}
		var regexpEscapeHtmlGt = /(>)/g;
		if (regexpEscapeHtmlGt.exec(strSearchTexts) != null) {
			strSearchTexts = strSearchTexts.replace(regexpEscapeHtmlGt, "&gt;");
			strSearchTextsOriginal = strSearchTextsOriginal.replace(regexpEscapeHtmlGt, "&gt;");
		}

		// NOTE: ダブルクォーテーション自体は検索できない（完全一致検索のための囲み文字）

		// ----------------------------------------------------------------------------------------
		// 完全一致検索キーワードの切り分け
		// ----------------------------------------------------------------------------------------

		// 検索キーワード
		var bInQuot = false;
		var convert = new Array();
		var iLoopLength = strSearchTexts.length;

		// キーワード文字列を1文字ずつ走査
		for (var i = 0; i < iLoopLength; i++) {

			// 1文字取り出し
			var character = strSearchTexts.substring(i, i + 1);

			// ダブルクォーテーション開始・終了
			if (	(character == "\"")
				||	(character == "”")
				||	(character == "“")
			) {
				character = "";
				bInQuot = !bInQuot;

			// 囲み内にあるスペースはキーワード区切り文字としてみなさないようにするために退避
			} else if (bInQuot && ((character == " ") || (character == "　") || (character == "	") || (character == " "))) {
				character = "___SPACE___";
			}
			convert.push(character);
		}
		strSearchTexts = convert.join("");

		// 検索条件表示用キーワード
		var bInQuot = false;
		var convert = new Array();
		var iLoopLength = strSearchTextsOriginal.length;

		for (var i = 0; i < iLoopLength; i++) {
			var character = strSearchTextsOriginal.substring(i, i + 1);
			if (	(character == "\"")
				||	(character == "”")
				||	(character == "“")
			) {
				character = "";
				bInQuot = !bInQuot;
			} else if (bInQuot && ((character == " ") || (character == "　") || (character == "	") || (character == " "))) {
				character = "___SPACE___";
			}
			convert.push(character);
		}
		strSearchTextsOriginal = convert.join("");

		// ----------------------------------------------------------------------------------------
		// 複数指定された検索条件をスペースで区切る(全角スペースも許容)
		// ----------------------------------------------------------------------------------------
		// NOTE: 複数スペースで区切られた場合の考慮
		var res = /[\s　]+/; // NOTE: \sで全角文字を含むかどうかはブラウザーによって挙動が異なる
		var arrSearchText = strSearchTexts.split(res);
		var arrSearchTextOriginal = strSearchTextsOriginal.split(res);

		// NOTE: Safari3でキーワード前後に全角スペースがあると、配列に空の要素が作成されバーストが発生
		var iLoopLength = arrSearchText.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (arrSearchText[i] == "") {
				arrSearchText.splice(i, 1);
			}
		}
		var iLoopLength = arrSearchTextOriginal.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (arrSearchTextOriginal[i] == "") {
				arrSearchTextOriginal.splice(i, 1);
			}
		}

		// スペースしか入力されていない場合は検索処理をキャンセル
		if (arrSearchText.join("") == "") {
			document.getElementById("id_search").value = fncGetResourceByResourceId("enter_search_keyword");
			document.getElementById("id_search").style.color = "#808080";

//			// 検索初期表示にリセット
//			if (	(document.getElementById("id_search_results"))
//				&&	(document.getElementById("id_search_results").innerHTML.indexOf(fncGetResourceByResourceId("search_message_wait")) != -1)
//			) {
//				fncResetSearchDisplay();
//			}

			return false;
		}

		// 退避したダブルクォーテーション囲み内スペースを復元
		var iLoopLength = arrSearchText.length;
		for (var i = 0; i < iLoopLength; i++) {
			arrSearchText[i] = arrSearchText[i].replace(/___SPACE___/g, " ");
		}
		var iLoopLength = arrSearchTextOriginal.length;
		for (var i = 0; i < iLoopLength; i++) {
			arrSearchTextOriginal[i] = arrSearchTextOriginal[i].replace(/___SPACE___/g, " ");
		}

		// ----------------------------------------------------------------------------------------
		// 検索対象の絞込み
		// ----------------------------------------------------------------------------------------

		// カテゴリー絞込み状況を確認（トップページ・用語集での検索では絞込みしない）
		var strSelectedChaptersCount = "";
		if (document.getElementById("id_search_chapters")) {
			var objChapterCheckboxes = document.getElementById("id_search_chapters").getElementsByTagName("input");
			var iLoopLength = objChapterCheckboxes.length;
			var bChecked = false;
			var arrSelectedChapters = new Array();
			var arrUnSelectedChapters = new Array();

			// チェックボックスの状態を調査
			for (var i = 0; i < iLoopLength; i++) {
				if (objChapterCheckboxes[i].checked) {
					bChecked = true;
					arrSelectedChapters.push(objChapterCheckboxes[i].id);
				} else {
					arrUnSelectedChapters.push(objChapterCheckboxes[i].id);
				}
			}

			// ひとつもカテゴリーが選択されていない場合
			// または「すべてのカテゴリーから」が選択されている場合は、
			// すべてのカテゴリーが検索対象

			// すべて選択
			if (arrSelectedChapters.length == iLoopLength) {
//				strSelectedChaptersCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + fncGetResourceByResourceId("search_scope_all") + fncGetResourceByResourceId("search_scope_chapter") + "</div>";

			// カテゴリー指定
			} else if (	(arrSelectedChapters.length != 0)
//				&&	(!document.getElementById("id_search_options_search_scope_all").checked)
			) {
//				strSelectedChaptersCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + "<b>" + arrSelectedChapters.length + "</b>" + fncGetResourceByResourceId("search_scope_chapter") + "</div>";

			// 選択なし→すべて選択
			} else {
				arrSelectedChapters = arrUnSelectedChapters;
//				strSelectedChaptersCount = "<div class=\"search_scope_status\">" + fncGetResourceByResourceId("search_scope") + fncGetResourceByResourceId("search_scope_all") + fncGetResourceByResourceId("search_scope_chapter") + "</div>";
			}
		}

		// ----------------------------------------------------------------------------------------
		// 検索結果表示方法の定義
		// ----------------------------------------------------------------------------------------
		var iShowAround = fncGetConstantByName("search_show_around");
		if (!iShowAround) {
			iShowAround = 50;
		}
		var iShowAroundBefore = iShowAround;
		var iShowAroundAfter = iShowAround;
		var iShowResultCount = fncGetConstantByName("search_show_result_count");
		if (!iShowResultCount) {
			iShowResultCount = 10;
		}
		var iPageMaxRange = fncGetConstantByName("search_page_max_range"); // [2][3][4][5][6]
		if (!iPageMaxRange) {
			iPageMaxRange = 5;
		}
		var iPageRangeLeft = parseInt(iPageMaxRange / 2);
		var iPageRangeRight = parseInt(iPageMaxRange / 2);

		// 変数の初期化
		var strResultAll = "";
		var iFound = 0;
		var strPrevChapterId = "";
		var arrResults = new Array();

		if (strWindowType != "GLOSSARY") {

			// 検索条件の表示
			arrResults.push(strSelectedChaptersCount);
			var arrResultConditions = new Array();
//			arrResultConditions.push("<div class=\"search_result_conditions\">");
//			arrResultConditions.push(fncGetResourceByResourceId("search_result_conditions"));
//
//			// 10種類のカラーバリエーションを循環
//			var nMarkerColor = 0;
//			var iLoopLength = arrSearchTextOriginal.length;
//			for (var i = 0; i < iLoopLength; i++) {
//				arrResultConditions.push("<span class=\"hit hit_" + nMarkerColor + "\">");
//				arrResultConditions.push(arrSearchTextOriginal[i]);
//				arrResultConditions.push("</span> ");
//				nMarkerColor++;
//				if (nMarkerColor >= 10) {
//					nMarkerColor = 0;
//				}
//			}
//			arrResultConditions.push("</div>");
//			arrResults.push(arrResultConditions.join(""));
//
			// 検索結果の表示する箇所を追加
			arrResults.push("<div class=\"search_result_conditions\" id=\"id_search_result_item\"></div>");
		}

		// ----------------------------------------------------------------------------------------
		// 検索先情報 (search.json) の取得
		// ----------------------------------------------------------------------------------------
		var s = eval(search);

		// ----------------------------------------------------------------------------------------
		// 検索条件による絞込み
		// ----------------------------------------------------------------------------------------
		var nSearchTextLength = arrSearchText.length;
		for (var j = 0; j < nSearchTextLength; j++) {

			var strSearchText = arrSearchText[j];

			// マルチバイトの区別
			if (document.getElementById("id_search_options_multibyte")) {
				if (!document.getElementById("id_search_options_multibyte").checked) {
					strSearchText = fncConvertSearchText(strSearchText, true);
					arrSearchText[j] = strSearchText;
				}
			}

			// 大文字小文字の区別
			var strSearchOptionCaseSensitive = "i"; // 正規表現のフラグ「i」→区別あり
			if (document.getElementById("id_search_options_case")) {
				if (document.getElementById("id_search_options_case").checked) {
					strSearchOptionCaseSensitive = "";
				}

			// 用語集では常に「区別する」
			} else if (strWindowType == "GLOSSARY") {
				strSearchOptionCaseSensitive = "";

			// トップページではクッキーから設定内容を取得
			} else {
				if (fncGetCookie("SEARCH-OPTIONS-CASE") == "TRUE") {
					strSearchOptionCaseSensitive = "";
				}
			}
		}

		// 本文側でハイライトされた際の検索キーワード
		var strSearchedText = "";
		if (	(document.location.search)
			&&	(document.location.search.indexOf("?search=") != -1)
		) {
			strSearchedText = document.location.search.split("?search=")[1];
			strSearchedText = strSearchedText.split("&word=yes")[0];

			// トップページから検索した時の検索説明ページはハイライトさせない
			if (strSearchedText.indexOf("&marking=no") != -1) {
				strSearchedText = "";
			} else {
				strSearchedText = strSearchedText.split("&marking=")[0];
			}
			if (strSearchedText != "") {

				// 検索条件文字列をデコード
				strSearchedText = decodeURIComponent(strSearchedText);

				// 前後のスペースを除去しておく
				// NOTE: IEとそれ以外のブラウザーで、前後にスペースがあるかどうかでsplitの結果が変わる（IEの場合、空の要素は省かれる）
				strSearchedText = strSearchedText.trim();
				if (strSearchedText == fncGetResourceByResourceId("enter_search_keyword")) {
					strSearchedText = "";
				}
			}
		}

		// 検索先情報分ループ
		var iLoopLength = s.length;
		for (var i = 0; i < iLoopLength; i++) {

			// 検索先情報の取得
			var body = s[i].body;			// 本文
			var toc_id = s[i].toc_id;		// ID
			var title = s[i].title;			// タイトル
			var chapter = s[i].category;	// チャプターID

			// 本文が空ならスキップ
			if (!body) {
				continue;
			}

			// 検索対象チャプターかどうか
			if (	(strWindowType != "GLOSSARY")
				&&	(arrSelectedChapters.length != 0)
			) {
				if (arrSelectedChapters.indexOf("id_" + chapter) == -1) {
					continue;
				}
			}

			// AND検索処理：指定検索条件分ループ
			var strResultTopic = "";
			var nSearchTextLength = arrSearchText.length;
			var arrSummaryText = new Array();
			for (var j = 0; j < nSearchTextLength; j++) {
				var strSearchText = arrSearchText[j];

				// --------------------------------------------------------------------------------
				// 検索実行
				// --------------------------------------------------------------------------------
				var strSearchTextParam = "(" + strSearchText + ")";
				if (	(strWindowType == "GLOSSARY")
					&&	(strLangCode.match(/ja|zh|ko/) == null)
					&&	(strSearchText.match(/([()])/) == null)
				) {

					// 用語集の検索の場合、単語レベルで合致しているかどうか判定
					strSearchTextParam = "\\b(" + strSearchText + ")\\b";
				}
				var re = new RegExp(strSearchTextParam, strSearchOptionCaseSensitive);
				if (re.exec(body) == null) {

					// ヒット無し
					break;

				} else {

					// サマリー最大長さよりキーワードが長い場合、キーワードをそのままサマリーとして使う
					if (arrSearchTextOriginal[j].length > iShowAround) {
						arrSummaryText.push(arrSearchTextOriginal[j]);
					} else {

						// はじめに見つかった位置を調べる
						var iFoundPosition = body.search(re);
						if (iFoundPosition != -1) {

							// ------------------------------------------------------------------------
							// 実体参照文字列を除外する
							// ------------------------------------------------------------------------

							// ヒット位置から前方のテキストの末尾の「&」を探す
							var strAmpAfter = "";
							var strBeforeFound = body.substring(0, iFoundPosition);
							var nAmpAfter = strBeforeFound.lastIndexOf("&");
							if (strSearchText != "&") {
								if (nAmpAfter != -1) {
									strAmpAfter = strBeforeFound.substring(nAmpAfter);
								}
							}

							// ヒット位置から後方のテキストの最初の「;」を探す
							var strSemicolonBefore = "";
							if (arrSearchTextOriginal[j].indexOf(";") == -1) { // キーワードにセミコロンが含まれる場合は更に後方を調べる必要はない
								var strAfterFound = body.substring(iFoundPosition + arrSearchTextOriginal[j].length);
								var nSemicolonBefore = strAfterFound.indexOf(";");
								if (arrSearchTextOriginal[j] != ";") {
									if (nSemicolonBefore != -1) {
										strSemicolonBefore = strAfterFound.substring(0, nSemicolonBefore + 1);
									}
								}
							}

							// 文字列を結合してみる（小文字に揃えて評価）
							var strIsEntity = strAmpAfter + arrSearchTextOriginal[j].toLowerCase() + strSemicolonBefore;

							// 実体参照として成立した場合は、ヒット取消
							if (	(strIsEntity == "&amp;")
								||	(strIsEntity == "&lt;")
								||	(strIsEntity == "&gt;")
								||	(strIsEntity == "&quot;")
							) {
								break;
							}

							// ------------------------------------------------------------------------
							// はじめに見つかった付近のテキストを抽出
							// ------------------------------------------------------------------------

							// サマリーテキストの先端終端に実体参照文字列があると実体参照文字列の一部が検索結果に表示されてしまう
							var re_entity = /[&;]/;
							var iSearchTextLength = arrSearchTextOriginal[j].length;
							//if (re_entity.exec(body) != null) { // 検索先文字列に実体参照文字が含まれている場合は厳密チェック
							if (1 == 0) {

								// 前半開始位置文字
								var strAroundLeftCenter = body.substring(
									iFoundPosition - iShowAroundBefore,
									iFoundPosition - iShowAroundBefore + 1
								);

								// 前半開始位置から左に辿る
								var n = -1;
								var strAroundLeftLeft = "";
								while (strAroundLeftLeft.indexOf("&") == -1) {

									strAroundLeftLeft = body.substring(
										iFoundPosition - iShowAroundBefore + n,
										iFoundPosition - iShowAroundBefore + n + 1
									) + strAroundLeftLeft;

									// 最左端を超えたら終了
									if ((iFoundPosition - iShowAroundBefore + n) < 0) {
										strAroundLeftLeft = "";
										break;
									}
									n--;
								}

								// 前半開始位置から右に辿る
								var n = 1;
								var strAroundLeftRight = "";
								while (strAroundLeftRight.indexOf(";") == -1) {
									strAroundLeftRight += body.substring(
										iFoundPosition - iShowAroundBefore + n,
										iFoundPosition - iShowAroundBefore + n + 1
									);

									// 前半開始位置を超えたら終了
									if ((iFoundPosition - iShowAroundBefore + n) > iFoundPosition) {
										strAroundLeftRight = "";
										break;
									}
									n++;
								}

								var nAdjustExpandLeft = 0;
								if (	(strAroundLeftLeft + strAroundLeftCenter + strAroundLeftRight == "&amp;")
									||	(strAroundLeftLeft + strAroundLeftCenter + strAroundLeftRight == "&lt;")
									||	(strAroundLeftLeft + strAroundLeftCenter + strAroundLeftRight == "&gt;")
									||	(strAroundLeftLeft + strAroundLeftCenter + strAroundLeftRight == "&quot;")
								) {
									nAdjustExpandLeft = (strAroundLeftLeft.length) + (strAroundLeftCenter.length);
								}

								// ------------------------------------------------------------------------

								// 後半開始位置の1文字
								var strAroundRightCenter = body.substring(
									iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter,
									iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter + 1
								);

								// 後半開始位置から左に遡る
								var n = -1;
								var strAroundRightLeft = "";
								while (strAroundRightLeft.indexOf("&") == -1) {
									strAroundRightLeft = body.substring(
										iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter + n,
										iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter + n + 1
									) + strAroundRightLeft;

									// 後半開始位置を超えたら終了
									if ((iFoundPosition + iSearchTextLength - 1) > (iFoundPosition + iSearchTextLength - 1) + iShowAroundAfter + n) {
										strAroundRightLeft = "";
										break;
									}
									n--;
								}

								// 後半開始位置から右に辿る
								var n = 1;
								var strAroundRightRight = "";
								while (strAroundRightRight.indexOf(";") == -1) {
									strAroundRightRight += body.substring(
										iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter + n,
										iFoundPosition + iSearchTextLength - 1 + iShowAroundAfter + n + 1
									);

									// 最右端を超えたら終了
									if ((iFoundPosition + iSearchTextLength + iShowAroundAfter + n) > body.length) {
										strAroundRightRight = "";
										break;
									}
									n++;
								}

								var nAdjustExpandRight = 0;
								if (	(strAroundRightLeft + strAroundRightCenter + strAroundRightRight == "&amp;")
									||	(strAroundRightLeft + strAroundRightCenter + strAroundRightRight == "&lt;")
									||	(strAroundRightLeft + strAroundRightCenter + strAroundRightRight == "&gt;")
									||	(strAroundRightLeft + strAroundRightCenter + strAroundRightRight == "&quot;")
								) {
									nAdjustExpandRight = (strAroundRightRight.length) + (strAroundRightCenter.length);
								}

							} else {
								var nAdjustExpandLeft = 0;
								var nAdjustExpandRight = 0;
							}

							var strAroundText = body.substring(
								iFoundPosition - iShowAroundBefore - nAdjustExpandLeft,
								iFoundPosition + iShowAroundAfter + iSearchTextLength + nAdjustExpandRight
							);

							// 切り出し後の先頭の文字がタイ語の声調記号の場合は除去する
							while (1) {
								if (strAroundText.substring(0, 1).match(/[\u0E31]|[\u0E47-\u0E4E]|[\u0E34-\u0E3A]/) != null) {
									strAroundText = strAroundText.substring(1);
								} else {
									break;
								}
							}
							arrSummaryText.push(strAroundText);
						}
					}
				}

				// 複数指定されたすべての検索条件にヒット
				if (j == arrSearchText.length - 1) {

					// ヒット数カウントアップ
					iFound ++;

					// ページ範囲内かどうかの確認
					if (	(nPage * iShowResultCount >= iFound + 0)
						&&	(nPage * iShowResultCount - iShowResultCount < iFound + 0)
					) {
					} else {
						continue;
					}

					// サマリーを連結
					var strSummaryTexts = arrSummaryText.join(String.fromCharCode(0x2026));

					// マーキング
					// 10種類のカラーバリエーションを循環
					var nMarkerColor = 0;
					for (var k = 0; k < nSearchTextLength; k++) {

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

						var strSearchText = arrSearchText[k];

						// 検索キーワード内の実体参照文字列を一時的に1文字にパッキング
						strSearchText = strSearchText.replace(/&amp;/g, String.fromCharCode(0x02D6));	// "˖"
						strSearchText = strSearchText.replace(/&quot;/g, String.fromCharCode(0x02BA));	// "ʺ"
						strSearchText = strSearchText.replace(/&lt;/g, String.fromCharCode(0x02F1));	// "˱"
						strSearchText = strSearchText.replace(/&gt;/g, String.fromCharCode(0x02F2));	// "˲"

						// 用語集の場合は単語一致
						var strSearchTextParam = "(" + strSearchText + ")";
						if (strWindowType == "GLOSSARY") {
							strSearchTextParam = "\\b(" + strSearchText + ")\\b";
						}

						// 見つかった文字列にマーキングするための正規表現インスタンス
						var rem = new RegExp(strSearchTextParam, "g" + strSearchOptionCaseSensitive);

						// サマリーテキスト内の実体参照文字列を一時的に1文字にパッキング
						strSummaryTexts = strSummaryTexts.replace(/&amp;/g, String.fromCharCode(0x02D6));
						strSummaryTexts = strSummaryTexts.replace(/&quot;/g, String.fromCharCode(0x02BA));
						strSummaryTexts = strSummaryTexts.replace(/&lt;/g, String.fromCharCode(0x02F1));
						strSummaryTexts = strSummaryTexts.replace(/&gt;/g, String.fromCharCode(0x02F2));

						// 見つかった文字列にマーキング実行
						strSummaryTexts = strSummaryTexts.replace(rem, function($1, $2, $3) {

							// マーキングタグ自体が検索条件に合致し文字列置換されることを防ぐ
							var strMarkupText = String.fromCharCode(0x2045) + strMarkerColor + $1 + String.fromCharCode(0x2046);
							return strMarkupText;
						});

						// パッキングした文字列を実体参照に復元
						strSummaryTexts = strSummaryTexts.replace(/\u02D6/g, "&amp;");
						strSummaryTexts = strSummaryTexts.replace(/\u02BA/g, "&quot;");
						strSummaryTexts = strSummaryTexts.replace(/\u02F1/g, "&lt;");
						strSummaryTexts = strSummaryTexts.replace(/\u02F2/g, "&gt;");

						// マーキング色の循環
						nMarkerColor++;
						if (nMarkerColor >= 10) {
							nMarkerColor = 0;
						}
					}

					// マーキング箇所にタグを適用
					var retb = new RegExp("\u2045([\u2080-\u2089])", "g");
					var rete = new RegExp("\u2046", "g");
					strSummaryTexts = strSummaryTexts.replace(retb, "<span class=\"hit hit_$1\">");
					strSummaryTexts = strSummaryTexts.replace(rete, "</span>");
					strSummaryTexts = strSummaryTexts.replace(/\u2080/g, "0");
					strSummaryTexts = strSummaryTexts.replace(/\u2081/g, "1");
					strSummaryTexts = strSummaryTexts.replace(/\u2082/g, "2");
					strSummaryTexts = strSummaryTexts.replace(/\u2083/g, "3");
					strSummaryTexts = strSummaryTexts.replace(/\u2084/g, "4");
					strSummaryTexts = strSummaryTexts.replace(/\u2085/g, "5");
					strSummaryTexts = strSummaryTexts.replace(/\u2086/g, "6");
					strSummaryTexts = strSummaryTexts.replace(/\u2087/g, "7");
					strSummaryTexts = strSummaryTexts.replace(/\u2088/g, "8");
					strSummaryTexts = strSummaryTexts.replace(/\u2089/g, "9");
					strSummaryTexts = strSummaryTexts.replace(/\u2026/g, "...");

					// ----------------------------------------------------------------------------
					// 段落記号をスタイリング
					// ----------------------------------------------------------------------------
					strSummaryTexts = strSummaryTexts.replace(/¶+/g, "<span style=\"color:#C0C0C0\"><img src=\"../frame_images/src_para.png\" /></span>");

					// チャプターの表示（同一チャプターが続く限りは表示しない）
					if (strPrevChapterId != chapter) {
						arrResults.push("<div class=\"search_chapter_title\">" + fncGetChapterTitle(chapter) + "</div>");
						strPrevChapterId = chapter;
					}

					// ----------------------------------------------------------------------------
					// 検索結果のリンクとサマリー表示
					// ----------------------------------------------------------------------------
					arrResults.push("<div class=\"search_topic_title\">");
//					arrResults.push("<img src=\"../contents/styles/style000/style_link_to_upper.gif\" />");
//					arrResults.push("&nbsp;");

					// 同一検索条件で該当ページを表示中の場合は反転
					if (toc_id == document.body.toc_id) {
						if (strSearchedText == strSearchTexts) {
							arrResults.push("<a class=\"current\" style=\"color:#0582ba;cursor:default;\" href=\"javascript:fncOpenTopic('" + toc_id + "', " + nPage + ");void(0);\" title=\"" + title + "\">");
						} else {
							arrResults.push("<a href=\"javascript:fncOpenTopic('" + toc_id + "', " + nPage + ");void(0);\" title=\"" + title + "\">");
						}
						arrResults.push(title);
						arrResults.push("</a>");
					} else {
						arrResults.push("<a href=\"javascript:fncOpenTopic('" + toc_id + "', " + nPage + ");void(0);\" title=\"" + title + "\">");
						arrResults.push(title);
						arrResults.push("</a>");
					}
					arrResults.push("</div>");
					if (toc_id == document.body.toc_id) {
						if (strSearchedText == strSearchTexts) {
							arrResults.push("<div style=\"color:#0582ba;\">");
						}
					}
					arrResults.push("<div class=\"search_topic_summary\">");
					arrResults.push("...");
					arrResults.push(strSummaryTexts);
					arrResults.push("...");
					arrResults.push("</div>");
					if (toc_id == document.body.toc_id) {
						if (strSearchedText == strSearchTexts) {
							arrResults.push("</div>");
						}
					} 
				}
			}
		}

		// 検索キーワードの保持（結果リンククリック時に使用）
		arrResults.push("<input id=\"id_search_texts\" style=\"display:None;\" value=\"" + strSearchTexts + "\" />");

		// 検索結果をHTMLに貼り付け
		document.getElementById("id_search_results").innerHTML = arrResults.join("");
		document.getElementById("id_search_results").style.backgroundColor = "#fff";
		document.getElementById("id_search_results").style.display = "block";

		// 検索条件欄を選択状態にし、次に検索しやすいようにする
		//document.getElementById("id_search").select();

		// ----------------------------------------------------------------------------------------
		// 検索結果ステータス処理
		// ----------------------------------------------------------------------------------------
		var arrStatus = new Array();

		arrStatus.push("<span>");

		// 前の検索結果ページに戻るリンク
		if (nPage > 1) {
			arrStatus.push("<a href=\"#\" accesskey=\"p\" class=\"previous_active\" onclick=\"fncDoSearch(" + (nPage - 1) + ");\" title=\"" + fncGetResourceByResourceId("search_prev") + "\"><img src=\"../frame_images/srch_prev.png\" /></a> ");
		} else {
			arrStatus.push("<a disabled class=\"disabled\"><img src=\"../frame_images/srch_prev_dis.png\" /></a> ");
		}

		// 全体ページ数
		var nPageSize = parseInt(iFound / iShowResultCount);
		if (iFound % iShowResultCount != 0) {
			nPageSize ++;
		}

		// 各ページへのリンク作成
		var nStartPage = 1;
		var nEndPage = nPageSize;

		if (nPage - iPageRangeLeft > 1) {
			nStartPage = nPage - iPageRangeLeft;
		}

		// 検索数とページ数を表示
		if (document.getElementById("id_search_result_item")) {
			var arrResultItem = new Array();
			arrResultItem.push(fncGetResourceByResourceId("search_result_item"));
			arrResultItem.push(" " + "<b>" + iFound + "</b>" + " " + fncGetResourceByResourceId("search_found"));
			//arrResultItem.push(" " + "<b>" + nPageSize + "</b>" + " " + fncGetResourceByResourceId("search_page_total"));
			document.getElementById("id_search_result_item").innerHTML = arrResultItem.join("");
		}

		// ページ数が5以下の場合
		if (iPageMaxRange >= nPageSize) {
			nEndPage = nPageSize;
			nStartPage = 1;

		// 現在ページから2ページ先が5ページ以下の場合
		} else if (nPage + iPageRangeRight <= iPageMaxRange) {
			nEndPage = iPageMaxRange;

		// 現在ページから2ページ先にページがない場合
		} else if (nPage + iPageRangeRight >= nPageSize) {
			nEndPage = nPageSize;
			nStartPage = nEndPage - iPageMaxRange + 1;
		} else {
			nEndPage = nPage + iPageRangeRight;
		}

		for (var i = nStartPage; i <= nEndPage; i++) {

			// 現在ページ
			if (nPage == i) {
				arrStatus.push("<a class=\"page_current\" onclick=\"fncDoSearch(" + i + ");\">" + i + "</a>");
			} else {
				arrStatus.push("<a class=\"page\" onclick=\"fncDoSearch(" + i + ");\">" + i + "</a>");
			}
		}

		// 次の検索結果ページに戻るリンク
		if ((nPage + 1) <= nPageSize) {
			arrStatus.push(" <a href=\"#\" accesskey=\"n\" class=\"next_active\" onclick=\"fncDoSearch(" + (nPage + 1) + ");\" title=\"" + fncGetResourceByResourceId("search_next") + "\"><img src=\"../frame_images/srch_next.png\" /></a>");
		} else {
			arrStatus.push(" <a class=\"disabled\"><img src=\"../frame_images/srch_next_dis.png\" /></a>");
		}
		arrStatus.push("</span>");

		// 検索結果ステータスをHTMLに貼り付け
		document.getElementById("id_search_status").innerHTML = arrStatus.join("");

		if (strWindowType == "HOME") {

			// 検索キーワードの記憶
			var strSearchKeyword = document.getElementById("id_search_texts").value;
			fncSetCookie("SEARCH-KEYWORD", strSearchKeyword);
		}

		fncBounce();

		// 検索結果表示後スクロールを先頭に戻す
		document.getElementById("id_header").scrollIntoView(true);

	} catch (e) {
	}
}

//function fncSearchResultScroll(nScroll) {
//	document.getElementById("id_search_results").scrollTop = nScroll;
//}

function fncOpenTopic(toc_id, nPage) {
	try {
		var search_texts = encodeURIComponent(document.getElementById("id_search_texts").value);
		var strFilePath = "../contents/" + toc_id + ".html?search=" + search_texts;

		// 表示中の検索結果のページ数とスクロール位置を設定
		fncSetSearchResultsInfo(nPage);

		// 用語から本文を表示する場合は、単語単位でマーキングする
		if (strWindowType == "GLOSSARY") {
			strFilePath += "&word=yes";
		}

//		// トップページから検索した場合の末端コンテンツにはハイライトさせない
//		if (strWindowType == "HOME") {
//			strFilePath += "&marking=no";
//		}

		// ターゲットを前面に表示
		var wnd = window.open(strFilePath, "canon_main_window");

		// NOTE: WINFF4で親ウィンドウが閉じられていると、ウィンドウ再オープン時にターゲットが表示されず、ウィンドウ終了時の状態が復元されてしまう
		if (wnd.document.location.href == "about:blank") {
			var ti = window.setTimeout(
				function () {
					wnd.document.location.href= strFilePath;
				},
				13
			);
		}
		wnd.focus();
	} catch (e) {

		// フェールセーフ
		window.open(strFilePath);
	}
}

function fncSetSearchResultsInfo(nPage) {
	try {
		if (document.getElementById("id_search_results")) {

			// 用語以外の場合
			if (strWindowType != "GLOSSARY") {

				// 検索結果で表示中のページ数を保持
				fncSetCookie("SEARCH-RESULT-SETTING", nPage + ":" + document.getElementById("id_search_results").scrollTop);
			}
		}
	} catch (e) {
	}
}

function fncGetChapterTitle(toc_id) {
	try {
		var iLoopLength = c.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (c[i].id == toc_id) {
				return c[i].title;
			}
		}
	} catch (e) {
	}
}

//function fncToggleSearchOptions() {
//	try {
//		if (document.getElementById("id_search_options")) {
//			if (document.getElementById("id_search_options").style.display.toLowerCase() != "none") {
//				document.getElementById("id_search_options").style.display = "None";
//				document.getElementById("id_search_options_label").innerHTML = "<a href=\"#\" onclick=\"fncToggleSearchOptions();\" title=\"" + fncGetResourceByResourceId("search_options_show") + "\"><img src=\"../frame_images/srch_opt_show.gif\" title=\"[+]\" />" + fncGetResourceByResourceId("search_options_show") + "</a>";
//			} else {
//				document.getElementById("id_search_options").style.display = "Block";
//				document.getElementById("id_search_options_label").innerHTML = "<a href=\"#\" onclick=\"fncToggleSearchOptions();\" title=\"" + fncGetResourceByResourceId("search_options_hide") + "\"><img src=\"../frame_images/srch_opt_hide.gif\" title=\"[-]\" />" + fncGetResourceByResourceId("search_options_hide") + "</a>";
//			}
//			fncOnResize();
//		}
//	} catch (e) {
//	}
//}

function fncGenerateChapterCheckbox(strId, strTitle) {
	try {

		// NOTE: IDが数字から始まるとFirefox/SafariでIDとして認識されない
		var strReturn = "<div><input class=\"input_chapter\" type=\"checkbox\" id=\"id_" + strId + "\" onclick=\"fncSelectChaptersFromBelow();\" /><label for=\"id_" + strId + "\" title=\"" + strTitle + "\">" + strTitle + "</label></div>"
		return strReturn;
	} catch (e) {
	}
}

function fncSelectChaptersFromBelow() {
	try {
		document.getElementById("id_search_options_search_scope_chapter").checked = true;
	} catch (e) {
	}
}

function fncSelectChaptersFromAll() {
	try {

		// チェックボックスをすべてOFFにする
		var objChapterCheckboxes = document.getElementById("id_search_chapters").getElementsByTagName("input");
		var iLoopLength = objChapterCheckboxes.length;
		for (var i = 0; i < iLoopLength; i++) {
			objChapterCheckboxes[i].checked = false;
		}
	} catch (e) {
	}
}

function fncGetConstantByName(constant_name) {
	try {
		var o = eval(constant);
		return o[0][constant_name];
	} catch (e) {
	}
}

function fncGetWindowWidth() {
	try {

		// ウィンドウサイズの取得
		var obj = window;
		if (window.opera) {
			var w = obj.innerWidth;
		} else if(document.all) {
			var w = obj.document.body.clientWidth;
		} else if(document.getElementById) {
			var w = obj.innerWidth;
		}
		return w;
	} catch (e) {
	}
}

function fncGetWindowHeight() {
	try {

		// ウィンドウサイズの取得
		var obj = window;
		if (window.opera) {
			var h = obj.innerHeight;
		} else if(document.all) {
			var h = obj.document.body.clientHeight;
		} else if(document.getElementById) {
			var h = obj.innerHeight;
		}
		return h;
	} catch (e) {
	}
}
function fncGetCookiePrefixName() {
	try {
		return "CANON-EMANUAL-" + fncGetResourceByResourceId("pub_number") + "-";
	} catch (e) {
	}
}
function fncSetCookie(strName, strValue) {
	try {

		// 有効期限未設定のため、ブラウザを閉じるときにCookieを削除
		document.cookie = fncGetCookiePrefixName() + strName + "=" + encodeURIComponent(strValue) + ";path=/;";
	} catch (e) {
	}
}
function fncGetCookie(strName) {
	try {
		var arrCookie = document.cookie.split("; ");
		var iLoopLength = arrCookie.length;
		for (var i = 0; i < iLoopLength; i++) {
			var aCrumb = arrCookie[i].split("=");
			if (fncGetCookiePrefixName() + strName == aCrumb[0]) {
				if (aCrumb[1]) {
					return decodeURIComponent(aCrumb[1]);
				}
			}
		}
		return "";
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// マルチバイト区別しない正規表現の文字列を取得
// ------------------------------------------------------------------------------------------------
function fncConvertSearchText(strSearchText, bHtmlspecialchars) {
	try {
		var strConvert = "";
		var arrRegExp = fncGetRegExpArray();

		// 検索時に変換された&lt;&gt;&amp;を戻す
		strSearchText = strSearchText.replace(/&lt;/g ,'<');
		strSearchText = strSearchText.replace(/&gt;/g ,'>');
		strSearchText = strSearchText.replace(/&amp;/g ,'&');
		var nTextLength = strSearchText.length;

		// 入力された文字から変換対象となる文字を取得
		for (var i = 0; i < nTextLength; i++) {

			// 検索する文字列から1文字取得
			var character = strSearchText.substring(i, i + 1);
			var strRegExp = "";
			if (character.match(/[\u005C]/)) {

				// "\"の場合
				// 次の1文字を取得
				var characterNext = strSearchText.substring(i + 1, i + 2);
				if (character.match(/([$()\-^\\\|\[\]{},:+*.?])/)) {

					// エスケープされている場合
					strRegExp = fncGetRegExpString(character + characterNext, arrRegExp);

					// 処理した文字数分移動
					i++;
				}
			} else if (character.match(/[\uFF66-\uFF9F]/)) {

				// 半角カナの場合
				// 次の1文字を取得して濁点・半濁点の有無を確認
				var characterNext = strSearchText.substring(i + 1, i + 2);
				var bConvert = false;
				if (characterNext.match(/[\uFF9E-\uFF9F]/)) {

					// 濁点、半濁点を含む半角カナを全角カナに変換
					var singlebyteChar = character + characterNext;
					strRegExp = fncGetRegExpString(singlebyteChar, arrRegExp);
					if (strRegExp != singlebyteChar) {

						// 処理した文字数分移動
						i += characterNext.length;
					}
				}
			} else if (character.match(/[A-Za-z0-9]/)) {

				// 半角英数字の場合、「0xFEE0」を加算し全角英数字を取得
				var multibyteCode = character.charCodeAt(0) + 0xFEE0;
				var multibyteChar = String.fromCharCode(multibyteCode);
				strRegExp = "(" + character + "|" + multibyteChar + ")";
			} else if (character.match(/[\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/)) {

				// 全角英数字（Ａ-Ｚａ-ｚ０-９）の場合、「0xFEE0」を減算し半角英数時を取得
				var singlebyteCode = character.charCodeAt(0) - 0xFEE0;
				var singlebyteChar = String.fromCharCode(singlebyteCode);
				strRegExp = "(" + singlebyteChar + "|" + character + ")";
			}
			if (strRegExp == "") {

				// 変換していない場合は変換処理を実行
				strRegExp = fncGetRegExpString(character, arrRegExp);
			}
			strConvert += strRegExp;
		}

		if (bHtmlspecialchars) {

			// 指定がある場合は< > & を変換
			strConvert = strConvert.replace(/&/g ,'&amp;');
			strConvert = strConvert.replace(/</g ,'&lt;');
			strConvert = strConvert.replace(/>/g ,'&gt;');
		}
		return strConvert;
	} catch (e) {
	}
}

function fncGetRegExpString(strInputText, arrRegExp) {
	var strRegExp = strInputText;
	var strSep = fncGetRegExpSeparator();
	var nLength = arrRegExp.length;
	for (var nIndex = 0; nIndex < nLength; nIndex++) {

		// 変換テーブルから1行取得
		var strRegExpValue = arrRegExp[nIndex];
		var arrRegExpValue = strRegExpValue.split(strSep);
		var nLengthValue = arrRegExpValue.length;
		for (var nValue = 0; nValue < nLengthValue; nValue++) {
			var strValue = arrRegExpValue[nValue];
			if (strValue == strInputText) {

				// 変換対象の文字列と一致
				strRegExp = strRegExpValue.replace(strSep, "|");
				strRegExp = "(" + strRegExp + ")"
				break;
			}
		}
		if (strRegExp != strInputText) {

			// 変換済のため処理終了
			break;
		}
	}
	return strRegExp;
}

function fncGetRegExpArray() {
	var strSep = fncGetRegExpSeparator();

	// 1行に区別しない文字列を定義
	// 例: "ｱ" + strSep + "ア"
	// → "ｱ" と "ア" を区別しない
	var arrRegExpString = new Array(
		"\uFF71" + strSep + "\u30A2",				// "ｱ" "ア"
		"\uFF72" + strSep + "\u30A4",				// "ｲ" "イ"
		"\uFF73" + strSep + "\u30A6",				// "ｳ" "ウ"
		"\uFF74" + strSep + "\u30A8",				// "ｴ" "エ"
		"\uFF75" + strSep + "\u30AA",				// "ｵ" "オ"
		"\uFF76" + strSep + "\u30AB",				// "ｶ" "カ"
		"\uFF77" + strSep + "\u30AD",				// "ｷ" "キ"
		"\uFF78" + strSep + "\u30AF",				// "ｸ" "ク"
		"\uFF79" + strSep + "\u30B1",				// "ｹ" "ケ"
		"\uFF7A" + strSep + "\u30B3",				// "ｺ" "コ"
		"\uFF7B" + strSep + "\u30B5",				// "ｻ" "サ"
		"\uFF7C" + strSep + "\u30B7",				// "ｼ" "シ"
		"\uFF7D" + strSep + "\u30B9",				// "ｽ" "ス"
		"\uFF7E" + strSep + "\u30BB",				// "ｾ" "セ"
		"\uFF7F" + strSep + "\u30BD",				// "ｿ" "ソ"
		"\uFF80" + strSep + "\u30BF",				// "ﾀ" "タ"
		"\uFF81" + strSep + "\u30C1",				// "ﾁ" "チ"
		"\uFF82" + strSep + "\u30C4",				// "ﾂ" "ツ"
		"\uFF83" + strSep + "\u30C6",				// "ﾃ" "テ"
		"\uFF84" + strSep + "\u30C8",				// "ﾄ" "ト"
		"\uFF85" + strSep + "\u30CA",				// "ﾅ" "ナ"
		"\uFF86" + strSep + "\u30CB",				// "ﾆ" "ニ"
		"\uFF87" + strSep + "\u30CC",				// "ﾇ" "ヌ"
		"\uFF88" + strSep + "\u30CD",				// "ﾈ" "ネ"
		"\uFF89" + strSep + "\u30CE",				// "ﾉ" "ノ"
		"\uFF8A" + strSep + "\u30CF",				// "ﾊ" "ハ"
		"\uFF8B" + strSep + "\u30D2",				// "ﾋ" "ヒ"
		"\uFF8C" + strSep + "\u30D5",				// "ﾌ" "フ"
		"\uFF8D" + strSep + "\u30D8",				// "ﾍ" "ヘ"
		"\uFF8E" + strSep + "\u30DB",				// "ﾎ" "ホ"
		"\uFF8F" + strSep + "\u30DE",				// "ﾏ" "マ"
		"\uFF90" + strSep + "\u30DF",				// "ﾐ" "ミ"
		"\uFF91" + strSep + "\u30E0",				// "ﾑ" "ム"
		"\uFF92" + strSep + "\u30E1",				// "ﾒ" "メ"
		"\uFF93" + strSep + "\u30E2",				// "ﾓ" "モ"
		"\uFF94" + strSep + "\u30E4",				// "ﾔ" "ヤ"
		"\uFF95" + strSep + "\u30E6",				// "ﾕ" "ユ"
		"\uFF96" + strSep + "\u30E8",				// "ﾖ" "ヨ"
		"\uFF97" + strSep + "\u30E9",				// "ﾗ" "ラ"
		"\uFF98" + strSep + "\u30EA",				// "ﾘ" "リ"
		"\uFF99" + strSep + "\u30EB",				// "ﾙ" "ル"
		"\uFF9A" + strSep + "\u30EC",				// "ﾚ" "レ"
		"\uFF9B" + strSep + "\u30ED",				// "ﾛ" "ロ"
		"\uFF9C" + strSep + "\u30EF",				// "ﾜ" "ワ"
		"\uFF66" + strSep + "\u30F2",				// "ｦ" "ヲ"
		"\uFF9D" + strSep + "\u30F3",				// "ﾝ" "ン"
		"\uFF67" + strSep + "\u30A1",				// "ｧ" "ァ"
		"\uFF68" + strSep + "\u30A3",				// "ｨ" "ィ"
		"\uFF69" + strSep + "\u30A5",				// "ｩ" "ゥ"
		"\uFF6A" + strSep + "\u30A7",				// "ｪ" "ェ"
		"\uFF6B" + strSep + "\u30A9",				// "ｫ" "ォ"
		"\uFF6F" + strSep + "\u30C3",				// "ｯ" "ッ"
		"\uFF6C" + strSep + "\u30E3",				// "ｬ" "ャ"
		"\uFF6D" + strSep + "\u30E5",				// "ｭ" "ュ"
		"\uFF6E" + strSep + "\u30E7",				// "ｮ" "ョ"
		"\uFF73\uFF9E" + strSep + "\u30F4",				// "ｳﾞ" "ヴ"
		"\uFF76\uFF9E" + strSep + "\u30AC",				// "ｶﾞ" "ガ"
		"\uFF77\uFF9E" + strSep + "\u30AE",				// "ｷﾞ" "ギ"
		"\uFF78\uFF9E" + strSep + "\u30B0",				// "ｸﾞ" "グ"
		"\uFF79\uFF9E" + strSep + "\u30B2",				// "ｹﾞ" "ゲ"
		"\uFF7A\uFF9E" + strSep + "\u30B4",				// "ｺﾞ" "ゴ"
		"\uFF7B\uFF9E" + strSep + "\u30B6",				// "ｻﾞ" "ザ"
		"\uFF7C\uFF9E" + strSep + "\u30B8",				// "ｼﾞ" "ジ"
		"\uFF7D\uFF9E" + strSep + "\u30BA",				// "ｽﾞ" "ズ"
		"\uFF7E\uFF9E" + strSep + "\u30BC",				// "ｾﾞ" "ゼ"
		"\uFF7F\uFF9E" + strSep + "\u30BE",				// "ｿﾞ" "ゾ"
		"\uFF80\uFF9E" + strSep + "\u30C0",				// "ﾀﾞ" "ダ"
		"\uFF81\uFF9E" + strSep + "\u30C2",				// "ﾁﾞ" "ヂ"
		"\uFF82\uFF9E" + strSep + "\u30C5",				// "ﾂﾞ" "ヅ"
		"\uFF83\uFF9E" + strSep + "\u30C7",				// "ﾃﾞ" "デ"
		"\uFF84\uFF9E" + strSep + "\u30C9",				// "ﾄﾞ" "ド"
		"\uFF8A\uFF9E" + strSep + "\u30D0",				// "ﾊﾞ" "バ"
		"\uFF8B\uFF9E" + strSep + "\u30D3",				// "ﾋﾞ" "ビ"
		"\uFF8C\uFF9E" + strSep + "\u30D6",				// "ﾌﾞ" "ブ"
		"\uFF8D\uFF9E" + strSep + "\u30D9",				// "ﾍﾞ" "ベ"
		"\uFF8E\uFF9E" + strSep + "\u30DC",				// "ﾎﾞ" "ボ"
		"\uFF8A\uFF9F" + strSep + "\u30D1",				// "ﾊﾟ" "パ"
		"\uFF8B\uFF9F" + strSep + "\u30D4",				// "ﾋﾟ" "ピ"
		"\uFF8C\uFF9F" + strSep + "\u30D7",				// "ﾌﾟ" "プ"
		"\uFF8D\uFF9F" + strSep + "\u30DA",				// "ﾍﾟ" "ペ"
		"\uFF8E\uFF9F" + strSep + "\u30DD",				// "ﾎﾟ" "ポ"

		"\u0021" + strSep + "\uFF01",					// ! ！
		"\u0022" + strSep + "\u201D",					// " ”
		"\u0023" + strSep + "\uFF03",					// # ＃
		"\u005C\u0024" + strSep + "\uFF04",				// \$ ＄
		"\u0025" + strSep + "\uFF05",					// % ％
		"\u0026" + strSep + "\uFF06",					// & ＆
		"\u0027" + strSep + "\u2019",					// ' ’
		"\u005C\u0028" + strSep + "\uFF08",				// \( （
		"\u005C\u0029" + strSep + "\uFF09",				// \) ）
		"\u005C\u002A" + strSep + "\uFF0A",				// \* ＊
		"\u005C\u002B" + strSep + "\uFF0B",				// \+ ＋
		"\u005C\u002C" + strSep + "\uFF0C",				// \, ，
		"\u005C\u002D" + strSep + "\uFF0D",				// \- －
		"\u005C\u002E" + strSep + "\uFF0E",				// \. ．
		"\u002F" + strSep + "\uFF0F",					// / ／
		"\u005C\u003A" + strSep + "\uFF1A",				// \: ：
		"\u003B" + strSep + "\uFF1B",					// ; ；
		"\u003C" + strSep + "\uFF1C",					// < ＜
		"\u003D" + strSep + "\uFF1D",					// = ＝
		"\u003E" + strSep + "\uFF1E",					// > ＞
		"\u005C\u003F" + strSep + "\uFF1F",				// \? ？
		"\u0040" + strSep + "\uFF20",					// @ ＠
		"\u005C\u005B" + strSep + "\uFF3B",				// \[ ［
		"\u005C\u005C" + strSep + "\uFFE5",				// \\ ￥
		"\u005C\u005D" + strSep + "\uFF3D",				// \] ］
		"\u005C\u005E" + strSep + "\uFF3E",				// \^ ＾
		"\u005F" + strSep + "\uFF3F",					// _ ＿
		"\u0060" + strSep + "\u2018",					// ` ‘
		"\u005C\u007B" + strSep + "\uFF5B",				// \{ ｛
		"\u005C\u007C" + strSep + "\uFF5C",				// \| ｜
		"\u005C\u007D" + strSep + "\uFF5D",				// \} ｝
		"\u007E" + strSep + "\uFF5E",					// ~ ～
		"\uFF61" + strSep + "\u3002",					// ｡ 。
		"\uFF62" + strSep + "\u300C",					// ｢ 「
		"\uFF63" + strSep + "\u300D",					// ｣ 」
		"\uFF64" + strSep + "\u3001",					// ､ 、
		"\uFF65" + strSep + "\u30FB",					// ･ ・
		"\uFF70" + strSep + "\u30FC"					// ｰ ー
	);
	return arrRegExpString;
}

function fncGetRegExpSeparator() {
	return "###Separator###";
}

//function fncResetSearchDisplay() {
//	try {
//		var strSearchHelpLink = "";
//		var search_help_link_name = fncGetConstantByName("search_help");
//		if (search_help_link_name) {
//			search_help_node = fncGetTocNodeByLinkName(search_help_link_name);
//			if (search_help_node) {
//				strSearchHelpLink = "<div class=\"search_help\"><a href=\"../contents/" + search_help_node.href + "\" title=\"" + search_help_node.title + "\">" + search_help_node.title + "</a></div>";
//			}
//		}
//		document.getElementById("id_search_results").innerHTML = "<div class=\"message\"><img src=\"../frame_images/srch_initial.gif\" /><br />" + fncGetResourceByResourceId("search_message_initial") + "</div>" + strSearchHelpLink;
//	} catch (e) {
//	}
//}

String.prototype.trim = function() {
	return this.replace(/(^\s+|\s+$)/g, "");
};

if (!Array.indexOf) {
	Array.prototype.indexOf = function(target) {
		var iLoopLength = this.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (this[i] === target) { 
				return i;
			}
		}
		return -1;
	}
}

function fncBounce() {
	try {
		if ($("#id_search_bouncer").size() == 0) {			// li#stub が存在しないなら
			var objBouncer = document.createElement("div");
			objBouncer.id = "id_search_bouncer";
			$("#id_panel_search").append(objBouncer);
		}
		$("#id_search_bouncer").css({height: 0});
		if ($.browser.msie && parseInt($.browser.version) == 9) {
			var nGapSearch = $("#id_right").height() - $("#id_panel_search").height() - 40;
		} else {
			var nGapSearch = $("#id_right").height() - $("#id_panel_search").height() - 20;
		}
		if (nGapSearch < 0) {
			nGapSearch = 0;
		}
		$("#id_search_bouncer").css({backgroundColor: "#eee", height: nGapSearch});
	} catch (e) {
	}
}