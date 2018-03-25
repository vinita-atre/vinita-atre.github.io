var iChapterPanelHeight;
window.onload = function fncOnLoad() {
	try {

		// ----------------------------------------------------------------------------------------
		// タイトルの指定
		// ----------------------------------------------------------------------------------------
		document.title = fncGetResourceByResourceId("sitemap") + " - " + fncGetResourceByResourceId("title");

		fncIncludeHeader();
		fncIncludeFooter();
		fncLoadResource();
		fncGenerateDynamicLink();
		fncLoadSitemapChapters();

		// ----------------------------------------------------------------------------------------
		// カテゴリーのロード
		// ----------------------------------------------------------------------------------------
		var t = eval(toc);
		var nTLength = t.length;
		var strPrevGroup = "";
		var strDivMark = "::";
		var strGroupName = "";
		var arrCatHtml = new Array();
		var arrTocHtml = new Array();
		var arrCategories = new Array();
		var strResContentsLinkPrev = fncGetResourceByResourceId("contents_link_prev");
		var strResContentsLinkNext = fncGetResourceByResourceId("contents_link_next");
		var bH26 = false;

		// カテゴリー情報の収集
		for (var i = 0; i < nTLength; i++) {
			var toc_id = t[i].id;
			var toc_title = t[i].title;
			var toc_level = t[i].level;
			var toc_href = t[i].href;
			var toc_show_toc = t[i].show_toc;
			var toc_link_name = t[i].link_name;
			if (toc_show_toc == "n") {
				continue;
			}
			if (toc_level != 1) {
				continue;
			} else {
				arrCategories.push(t[i]);
			}
		}

		// 各ノード分ループ
		var j = 0;
		for (var i = 0; i < nTLength; i++) {
			var toc_id = t[i].id;
			var toc_title = t[i].title;
			var toc_level = t[i].level;
			var toc_href = t[i].href;
			var toc_show_toc = t[i].show_toc;
			var toc_link_name = t[i].link_name;

			if (toc_show_toc == "n") {
				continue;
			}

			// カテゴリーレベルのノード
			if (	(toc_level == 1)
				&&	(toc_link_name != "")
			) {
				var nDivPos = toc_link_name.indexOf(strDivMark);
				if (toc_link_name.indexOf(strDivMark) != -1) {
					toc_link_name = toc_link_name.substring(nDivPos + strDivMark.length);
				}

				// カテゴリーの表示
				arrCatHtml.push("<a href=\"#id_" + toc_link_name + "\"><img src=\"../frame_images/cnt_link_next.gif\" />");
				arrCatHtml.push(toc_title);
				arrCatHtml.push("</a>");
			}

			arrTocHtml.push("<h" + toc_level + ">");

			// カテゴリータイトル <h1>
			if ((toc_level == 1) && (toc_link_name != "")) {
				bH26 = false;

				arrTocHtml.push("<table class=\"h1\" cellspacing=\"0\" cellpadding=\"0\">");
				arrTocHtml.push("<tr>");
				arrTocHtml.push("<th><span>");

				// アイコン
				arrTocHtml.push("<img src=\"../frame_images/f_chp_btn_" + toc_link_name + "_5.png\" style=\"vertical-align:middle;width:36px;height:23px;\" />");

				// タイトル
				if (!toc_href) {
					arrTocHtml.push(toc_title);
				} else {
					arrTocHtml.push("<a class=\"anchor\" id=\"id_" + toc_link_name + "\"></a><a href=\"../contents/" + toc_href + "\">" + toc_title + "</a>");
				}
				arrTocHtml.push("</span></th>");
				arrTocHtml.push("<td>");

				// 前へ
				if (j > 0) {
					var nDivPos = arrCategories[j - 1].link_name.indexOf(strDivMark);
					var prev_link_name = arrCategories[j - 1].link_name;
					if (nDivPos != -1) {
						prev_link_name = prev_link_name.substring(nDivPos + strDivMark.length);
					}
					//arrTocHtml.push("<a href=\"#id_" + prev_link_name + "\"><img src=\"../frame_images/cnt_link_prev.png\" />" + strResContentsLinkPrev + "</a> "); // NOTE: ng ie6, ff2
					if (j < arrCategories.length - 1) {
						arrTocHtml.push("<a href=\"javascript:fncSitemapScroll('" + prev_link_name + "');\"><img src=\"../frame_images/cnt_link_prev.png\" />" + strResContentsLinkPrev + "</a> ");
					} else {
						arrTocHtml.push("<a href=\"javascript:fncSitemapScroll('" + prev_link_name + "');\" style=\"border-right: solid 1px #eee;width:149px;\"><img src=\"../frame_images/cnt_link_prev.png\" />" + strResContentsLinkPrev + "</a> ");
					}
				} else {
					arrTocHtml.push("<a style=\"width:150px;\">&nbsp;</a>");
				}

				// 次へ
				if (j < arrCategories.length - 1) {
					var nDivPos = arrCategories[j + 1].link_name.indexOf(strDivMark);
					var next_link_name = arrCategories[j + 1].link_name;
					if (nDivPos != -1) {
						next_link_name = next_link_name.substring(nDivPos + strDivMark.length);
					}
					//arrTocHtml.push("<a href=\"#id_" + next_link_name + "\"><img src=\"../frame_images/cnt_link_next.png\" />" + strResContentsLinkNext + "</a> "); // NOTE: ng ie6, ff2
					arrTocHtml.push("<a href=\"javascript:fncSitemapScroll('" + next_link_name + "');\" style=\"border-left: solid 1px #eee;width:149px;\"><img src=\"../frame_images/cnt_link_next.png\" />" + strResContentsLinkNext + "</a> ");
				}

				arrTocHtml.push("</td>");
				arrTocHtml.push("</tr>");
				arrTocHtml.push("</table>");
				j++;

			// <h2>～<h6>
			} else {
				bH26 = true;
				if (!toc_href) {
					arrTocHtml.push(toc_title);
				} else {
					arrTocHtml.push("<a id=\"id_" + toc_link_name + "\" href=\"../contents/" + toc_href + "\">" + toc_title + "</a>");
				}
			}
			arrTocHtml.push("</h" + toc_level + ">");
		}
		arrCatHtml.push("</td></tr></table>");
		document.getElementById("id_toc").innerHTML = arrTocHtml.join("");

		// タブ位置の記憶（Site mapから遷移した場合は、必ず目次タブに戻す）
		var strTabPosition = "0";
		fncSetCookie("TAB-POSITION", strTabPosition);

		// 「Contents」タブ表示時にスクロール位置を初期化する
		fncSetCookie("CONTENTS-SCROLL", "INIT");

		// トップに戻るボタンのスクロール追従
		var offsetBackTotheTop = 80;
		var topPaddingBackTotheTop = 80;
		$(window).scroll(function() {
			if ($(window).scrollTop() > offsetBackTotheTop) {
				$("#back_to_the_top").stop().css({
					marginTop: $(window).scrollTop() - offsetBackTotheTop + topPaddingBackTotheTop
				});
			} else {
				$("#back_to_the_top").stop().css({
					marginTop: 0
				});
			}
		});

		// ----------------------------------------------------------------------------------------
		// 印刷ボタン
		// ----------------------------------------------------------------------------------------
		if (document.getElementById("id_res_bar_icon_print")) {
			document.getElementById("id_res_bar_icon_print").onclick = function() {
				window.print();
			}
		}

		// カテゴリーパネルの垂直位置調整
		if (	($.browser.msie && parseInt($.browser.version) == 6)
			||	($.browser.msie && parseInt($.browser.version) == 7)
		) {
			$("ul#id_sitemap_chapters li a span").each(function() {
				$(this).css("margin-top", (50 / 2) - ($(this).height() / 2));
			});
		}

	} catch (e) {
	}
}
function fncLoadSitemapChapters() {
	var ul = document.getElementById("id_sitemap_chapters");

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

//			// <li>要素の作成
//			if (	($.browser.msie && parseInt($.browser.version) == 6)
//				||	($.browser.msie && parseInt($.browser.version) == 7)
//			) {
//				var span = document.createElement("span");
//				var a = document.createElement("a");
//				var li = document.createElement("li");
//				span.innerHTML = node.title;
//				a.title = node.title;
//				a.link_name = strTocLinkName;
//				a.style.backgroundImage = "url(../frame_images/f_chp_btn_" + strTocLinkName + "_2.png)";
//				a.onclick = function() {
//					//document.location.href = "#id_" + this.link_name;
//					fncSitemapScroll(this.link_name);
//				};
//				if ($.browser.msie && parseInt($.browser.version) == 6) {
//					a.onmouseover = function() {
//						this.style.backgroundColor = "#888";
//						this.style.color = "#faa500";
//					};
//					a.onmouseout = function() {
//						this.style.backgroundColor = "#aaa";
//						this.style.color = "#fff";
//					};
//				}
//				a.appendChild(span);
//				li.appendChild(a);
//				ul.appendChild(li);
//			} else {
			var button = document.createElement("button");
			var li = document.createElement("li");
//				button.innerHTML = node.title;
			button.title = node.title;
			button.link_name = strTocLinkName;
			button.style.backgroundImage = "url(../frame_images/f_chp_btn_" + strTocLinkName + "_2.png)";
			button.onclick = function() {
				//document.location.href = "#id_" + this.link_name;
				fncSitemapScroll(this.link_name);
			};
			li.appendChild(button);
			ul.appendChild(li);
//			}
		}
	}

	// チャプターパネルの高さ取得
	iChapterPanelHeight = $("#id_sitemap_chapters").height();
	$("#id_sitemap #id_toc").css({paddingTop: iChapterPanelHeight});
}

function fncSitemapScroll(strLinkName) {
	// NOTE: for ie6, ff2
//	$("html").scrollTop( // ng sf5
	$("html, body").scrollTop(
//		$("#id_" + strLinkName).offset().top - iChapterPanelHeight - 20
		$("#id_" + strLinkName).offset().top - 20
	);
}