window.onload = function fncOnLoad() {
	try {

		// print_chapter.html?chapter=[id]
		var strChapter = document.location.search.substring(9);
		strChapter = decodeURI(strChapter);

		// toc.jsonをロード
		var t = eval(toc);

		var strHtml = "";
		var arrHtml = new Array();

		// 印刷依頼メッセージ
		var strPrintInstructions = "\t\t\t<div class=\"print_instructions\">" + fncGetResourceByResourceId("print_instructions") + "</div>\n\t\t\t<div id=\"id_content\">\n";

		var strTemp = "";
		var strDelimiterBegin	= "<!--CONTENT_START-->";
		var strDelimiterEnd		= "<!--CONTENT_END-->";

		// 印刷対象チャプターフラグ
		var bCurrentChapter;

		// チャプター分けされていない場合はすべて印刷対象
		var bPrintAll = false;
		if (strChapter == "ALL") {
			bPrintAll = true;
		}

		// 各モジュールで使用されているCSSのリスト
		var arrStyles = new Array();

		// toc.json要素分ループ
		var iLoopLength = t.length;
		for (var i = 0; i < iLoopLength; i++) {

			// 指定されたチャプターのidと一致
			if (	(t[i].id == strChapter)
				||	(bPrintAll)
			) {
				bCurrentChapter = true;

				// ウィンドウタイトルはチャプター名
				document.title = t[i].title;

				// スタイル番号を取得
				if (t[i].style && t[i].style != "") {
					if (arrStyles.indexOf(t[i].style) == -1) {
						arrStyles.push(t[i].style);
					}
				}

			// チャプターが一致するので印刷対象
			} else if (	(bCurrentChapter)
				&&	(1 < t[i].level)
				&&	(t[i].href)
			) {

				// 目次にないトピックは印刷しない
				if (t[i].show_toc == "n") {
					continue;
				}

				// スタイル番号を取得
				if (t[i].style && t[i].style != "") {
					if (arrStyles.indexOf(t[i].style) == -1) {
						arrStyles.push(t[i].style);
					}
				}

			// 印刷対象外
			} else {

				bCurrentChapter = false;

				// 以降処理不要
				if (bCurrentChapter) {
					break;
				}
				continue;
			}

			// 使用するAJAX収集手段を判定
			var bUseJqAjax = true;
			var ua = window.navigator.userAgent.toLowerCase();
			var isIE;
			if (ua.indexOf("msie") != -1 || ua.indexOf("trident") != -1) {
				isIE = true;
			}
			if (isIE) {
				var array;
				var version;
				array = /[msie|rv:]([\d\.]+)/.exec(ua);
				if (array) {
					version = array[1];
				} else {
					version = "";
				}

				// IE11の場合、ローカルコンテンツはjQueryを用いずAjax処理
				if (version >= 11) {
//					if (document.location.href.indexOf("file:///") != -1) { // ローカルコンテンツ
						bUseJqAjax = false;
//					}
				}
			}

			// AJAXによるコンテンツデータ収集
			if (bUseJqAjax) {
				strTemp = $.ajax({url:"../contents/" + t[i].href, async:false}).responseText;
			} else {
				strTemp = fncGetPageForPrintChapter("../contents/" + t[i].href);
			}

			// 不要部分の除去
			if (strTemp) {
				strTemp = strTemp.substring(
					strTemp.indexOf(strDelimiterBegin) + strDelimiterBegin.length + 30,
					strTemp.lastIndexOf(strDelimiterEnd) - 13
				);
				arrHtml.push(strTemp);
			}
		}

		// 収集したHTMLをページ内に配置
		strHtml = arrHtml.join("\t<div class=\"page_end\">&nbsp;</div>\n");
		document.body.innerHTML = strPrintInstructions + strHtml + "\n\t\t\t</div>\n";

		// ウィンドウタイトルが末尾のトピックタイトルになることを防ぐ
		document.title = fncGetResourceByResourceId("title");

		// CSSを動的にロードする
		var iLoopLength = arrStyles.length;
		for (var i = 0; i < iLoopLength; i++) {
			if (arrStyles[i] == "") {
				continue;
			}
			var link = document.createElement("link");
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = "styles/style" + arrStyles[i] + "/style.css";
			document.getElementsByTagName("head")[0].appendChild(link);
		}

		// ----------------------------------------------------------------------------------------
		// 本文レイアウト調整
		// ----------------------------------------------------------------------------------------

		// 通常のCSSをロード
		var objLink = document.getElementsByTagName("link");
		var nLinkLength = objLink.length;
		var strStyleNumber = "";
		for (var i = 0; i < nLinkLength; i++) {

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
		if (	($.browser.msie && parseInt($.browser.version) != 6)
		) {
			$("div.annotation span.superscript").css({width: "1.5em", display: "Inline-Block", textAlign: "Right", marginLeft: "-2px", position: "Relative"});
		}

		// h2内の折り畳み展開ボタンを垂直中央に揃える
		$("div.h2 img").each(function() {
			$(this).css("display", "none");
			$(this).css({"position": "absolute", "top": ($(this).parent().outerHeight() / 2) - (20 / 2)});
			$(this).css("display", "inline");
		});

		// NOTE: 印刷命令はユーザーに委ねる
//		window.print();
//
//		// ウィンドウ終了
//		window.close();

	} catch (e) {
	}
}
function fncGetPageForPrintChapter(pageURL) {
	xmlhttp = createXMLHttpForPrintChapter();
	if (xmlhttp) {
		strReturnValue = null;
		xmlhttp.onreadystatechange = setPageDataForPrintChapter;
		xmlhttp.open('GET', pageURL, true);
		xmlhttp.send(null);
		if (strReturnValue) {
			return strReturnValue;
		}
	}
}
function setPageDataForPrintChapter() {
	if (xmlhttp.readyState == 4) {
		try {
			strReturnValue = xmlhttp.responseText;
		} catch (e) {
		}
	}
}
function createXMLHttpForPrintChapter() {
	try {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} catch (e) {
		try {
			return new XMLHttpRequest();
		} catch (e) {
			return null;
		}
	}
	return null;
}