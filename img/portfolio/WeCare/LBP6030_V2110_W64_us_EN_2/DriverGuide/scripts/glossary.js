var g = eval(glossary);
window.onload = function fncOnLoad() {
	try {

		// ----------------------------------------------------------------------------------------
		// タイトルの指定
		// ----------------------------------------------------------------------------------------
		document.title = fncGetResourceByResourceId("glossary") + " - " + fncGetResourceByResourceId("title");

		// リソース定義のマッピング
		fncLoadResource();

		// 検索結果表示領域のサイズ調整
		fncOnResize();

		// インデックスの作成
		fncGenerateInitials();

		// ----------------------------------------------------------------------------------------
		// マーキングされた本文からジャンプしてきた場合、該当用語集を表示
		// ----------------------------------------------------------------------------------------
		// 用語文字列を引数から取得
		var strGlossaryWord = document.location.search.split("?word=")[1];
		if (	(strGlossaryWord != "")
			&&	(strGlossaryWord != undefined)
		) {
			strGlossaryWord = decodeURIComponent(strGlossaryWord);
			var iLoopLength = g.length;
			for (var i = 0; i < iLoopLength; i++) {
				var jLoopLength = g[i].words.length;
				for (var j = 0; j < jLoopLength; j++) {
					if (strGlossaryWord == g[i].words[j].word) {
						fncLoadGlossary(i);
						fncLoadWord(i, j);
					}
				}
			}
		} else {

			// 先頭の項目が選択された状態で初期表示
			fncLoadGlossary(0);
			fncLoadWord(0, 0);
		}
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 見出しボタンの配置
// ------------------------------------------------------------------------------------------------
function fncGenerateInitials() {
	try {

		// 用語情報分ループ
		var nGLength = g.length;
		var arrInitial = new Array();
		for (var i = 0; i < nGLength; i++) {
			var initial = g[i].initial;
			var nInitialLength = initial.length;
			var nButtonWidth = "";

			// 見出し名が1文字の時はボタン幅固定
			if (nInitialLength == 1) {
				nButtonWidth = "23px";
			} else {
				nButtonWidth = "auto";
			}

			// 見出しボタンの配置（アクセスキー自動設定）
			arrInitial.push("<button class=\"normal\" onclick=\"fncLoadGlossary('" + i + "');\" style=\"width:" + nButtonWidth + ";\" id=\"id_" + i + "\" accesskey=\"" + initial + "\" title=\"" + initial + "\">");
			arrInitial.push(initial);
			arrInitial.push("</button>");
		}
		document.getElementById("id_initials").innerHTML = arrInitial.join("");
	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 指定された見出しの用語タイトルをロード
// ------------------------------------------------------------------------------------------------
function fncLoadGlossary(nInitial) {
	try {
		var arrWord = new Array();
		var nWLength = g[nInitial].words.length;
		for (var i = 0; i < nWLength; i++) {
			var word = g[nInitial].words[i].word;
			var desc = g[nInitial].words[i].desc;
			arrWord.push("<a href=\"#\" onclick=\"fncLoadWord(" + nInitial + ", " + i + ");\" title=\"" + word + "\">");
			arrWord.push("<div class=\"normal\" id=\"id_" + nInitial + "_" + i + "\">");
			arrWord.push(word);
			arrWord.push("</div>");
			arrWord.push("</a>");

		}
		document.getElementById("id_words").innerHTML = arrWord.join("");
		document.getElementById("id_desc").innerHTML = "";

		// 選択されたイニシャルをハイライト表示
		var objButtons = document.getElementById("id_initials").getElementsByTagName("button");
		var nButtonLength = objButtons.length;
		for (var i = 0; i < nButtonLength; i++) {
			objButtons[i].className = "normal";
		}
		document.getElementById("id_" + nInitial).className = "click";

	} catch (e) {
	}
}

// ------------------------------------------------------------------------------------------------
// 指定された用語の説明をロード
// ------------------------------------------------------------------------------------------------
function fncLoadWord(nInitial, nWord) {
	try {

		var word = g[nInitial].words[nWord];
		var title = word.word;
		var desc = word.desc;

		var arrDesc = new Array();

		// タイトル
		arrDesc.push("<div class=\"title\" id=\"id_title\">");
		arrDesc.push(title);
		arrDesc.push("</div>");

		// 説明
		arrDesc.push("<div class=\"desc\">");
		arrDesc.push(desc);
		arrDesc.push("</div>");

		// この用語を使用している末端コンテンツを検索
		arrDesc.push("<div class=\"search_glossary\"><a href=\"#\" onclick=\"fncDoGlossarySearch();\" class=\"search_glossary\" id=\"id_res_search_glossary\" title=\"" + fncGetResourceByResourceId("search_glossary") + "\">" + fncGetResourceByResourceId("search_glossary") + "</a></div>");

		// 検索キーワード→"用語タイトル"（ダブルクォーテーションによる完全一致検索）
		arrDesc.push("<input id=\"id_search\" value=\"&quot;" + title + "&quot;\" />");

		// 検索結果欄、ステータス欄はデフォルトでは非表示→検索実行時に表示する
		arrDesc.push("<div id=\"id_search_results\" style=\"display:None;\"></div>");
		arrDesc.push("<div id=\"id_search_status\" style=\"display:None;\"></div>");

		// 用語集右領域にHTMLを出力
		document.getElementById("id_desc").innerHTML = arrDesc.join("");

		// 選択された用語をハイライト表示
		var objDivs = document.getElementById("id_words").getElementsByTagName("div");
		var nDivLength = objDivs.length;
		for (var i = 0; i < nDivLength; i++) {
			objDivs[i].className = "normal";
		}
		document.getElementById("id_" + nInitial + "_" + nWord).className = "click";

		// スクロールしないと隠れている選択用語を頭出し
		if (document.getElementById("id_" + nInitial + "_" + nWord).offsetTop > document.getElementById("id_words").offsetHeight) {
			document.getElementById("id_" + nInitial + "_" + nWord).scrollIntoView();
		}

		// 検索結果のチャプタータイトル表示で使用
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
	} catch (e) {
	}
}
function fncDoGlossarySearch() {
	try {
		if (document.getElementById("id_search_results")) {
			document.getElementById("id_search_results").style.display = "block";
		}
		if (document.getElementById("id_search_status")) {
			document.getElementById("id_search_status").style.display = "block";
		}
		if (document.getElementById("id_res_search_glossary")) {
			document.getElementById("id_res_search_glossary").style.display = "none";
		}
		fncDoSearch(1);

		// 該当ページなし
		if (document.getElementById("id_search_results").childNodes.length == 1) {
			document.getElementById("id_search_results").style.display = "none";
			document.getElementById("id_search_status").style.display = "none";
			document.getElementById("id_res_search_glossary").style.display = "block";
			document.getElementById("id_res_search_glossary").parentNode.innerHTML = fncGetResourceByResourceId("search_glossary_not_found");
		}
	} catch (e) {
	}
}

// イベント処理
document.onkeypress = fncKeyPress;
window.onresize = fncOnResize;

// 検索結果欄の高さを動的に計算
function fncOnResize() {
	try {
		var obj = window;
		if(window.opera) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		} else if (document.all) {
			var w = obj.document.body.clientWidth;
			var h = obj.document.body.clientHeight;
		} else if (document.getElementById) {
			var w = obj.innerWidth;
			var h = obj.innerHeight;
		}
		document.getElementById("id_words").style.height = h - 130 + "px";
		document.getElementById("id_desc").style.height = h - 130 + "px";
		document.getElementById("id_desc").style.width = w - 310 + "px";
	} catch (e) {
	}
}

var strWindowType = "GLOSSARY";
var c = new Array();