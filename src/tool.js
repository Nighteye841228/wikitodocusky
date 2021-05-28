import * as $ from 'jquery';
import axios from 'axios';

let dt = new Date();
$.expr[':'].regex = function (elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels, '')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
    return regex.test($(elem)[attr.method](attr.property));
}

export { $ , dt };

export async function getDeeperLink(pageNames) {
    pageNames = pageNames.split("\n").filter((x) => x);
    for (const pageName of pageNames) {
        try {
            let apiBackJson = await axios.get(
                "https://zh.wikisource.org/w/api.php", {
                    params: {
                        action: "parse",
                        page: pageName,
                        origin: "*",
                        format: "json",
                        utf8: "",
                    },
                }
            );
            let newLinks = await getExtendedLinks(apiBackJson.data.parse);
            newLinks = newLinks.filter((x) => x.indexOf(pageNames) === -1);
            return newLinks;
        } catch (error) {
            console.log(error);
            alert(`請求出錯！`);
        }
    }
}

export async function searchWord(title) {
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php", {
                params: {
                    action: "query",
                    list: "search",
                    srsearch: title,
                    origin: "*",
                    format: "json",
                    utf8: "",
                    srlimit: 100,
                },
            }
        );
        let outputs = await apiBackJson.data.query.search;
        console.log(outputs);
        outputs = outputs.map((x) =>
            x .title.replace(/\/.*$/g, "").replace(/[0-9-]*$/g, "")
        );
        return [...new Set(outputs)];
    } catch (error) {
        console.log(error);
        alert(`請求出錯！`);
    }
}

export function parseHtmlText(htmlContent, title) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiContentSeperateParagraph = [];
    let mainContent = $(doc).find(".mw-parser-output p,.mw-parser-output dd");

    if (
        $(mainContent).text() !== undefined &&
        $(mainContent).text().match(/重定向/g)
    ) {
        alert(
            `頁面:"${title}"被重新導向至"${$(doc)
                .find(".mw-parser-output a")
                .text()}"，請察看維基文庫頁面確認正確標題或搜尋`
        );
    }

    for (let x = 0; x < 10; x++) {
        $(mainContent)
            .find("*:not(a)")
            .each(function (index, element) {
                // console.log($(element).html());
                let x = $(element).html();
                $(element).replaceWith(x);
            });
    }

    $(mainContent)
        .find("a")
        .each(function (index, element) {
            let linkTitle = $(element).html();
            let linkRef =
                $(element).attr("href") !== undefined &&
                $(element)
                .attr("href")
                .match(/^\/wiki\//g) ?
                `https://zh.wikisource.org${$(element).attr("href")}` :
                $(element).attr("href");
            $(element).replaceWith(
                composeXmlString(
                    linkTitle,
                    "Udef_wiki",
                    1,
                    ` Term="${linkTitle}" Url="${linkRef}"`
                )
            );
        });

    $(mainContent).each(function (index, element) {
        let parseSentence = $(element)
            .text()
            .replace(/\s/gm, "")
            .replace(/^\r\n|^\n/gm, "")
            .replace(
                /（并请在校对之后从条目的源代码中删除本模版：{{简转繁}}）/gm,
                ""
            )
            .replace(/&lt;(\W+)&gt;/g, "【$1】");
        let parseSentenceWithHtml = $(element)
            .html()
            .replace(/&lt;(\W+)&gt;/g, "【$1】");
        if (!/(屬於公有領域)/gm.test(parseSentence) && parseSentence != "") {
            wikiContentSeperateParagraph.push({
                paragraphs: parseSentence,
                hyperlinks: parseSentenceWithHtml
                    .replace(/udef_wiki/g, "Udef_wiki")
                    .replace(/url/g, "Url")
                    .replace(/term/g, "Term"),
            });
        }
    });
    let pureText = wikiContentSeperateParagraph
        .map((element) => {
            return element.paragraphs;
        })
        .join("\n");
    let urlLinkText = wikiContentSeperateParagraph
        .map((element) => {
            return element.hyperlinks;
        })
        .join("\n");
    return {
        paragraphs: pureText,
        hyperlinks: urlLinkText
    };
}

export function parseAuthor(htmlContent) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiAuthor = "";
    $(doc)
        .find(`a`)
        .each(function (index, element) {
            if (
                $(element).prop("title") !== undefined &&
                $(element)
                .prop("title")
                .match(/Author:.*/)
            ) {
                wikiAuthor = $(element)
                    .prop("title")
                    .replace(/Author:|（(頁面不存在)*）/g, "");
            }
        });
    return wikiAuthor;
}

export function parseHtmlHyperlinkText(htmlContent) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiContentSeperateParagraph = [];
    $(doc)
        .find(`a`)
        .each(function (index, element) {
            if (
                $(element).attr("href") != undefined &&
                $(element).text() !== "" &&
                $(element)
                .attr("href")
                .match(/^\/wiki\//g)
            ) {
                let wikilink =
                    $(element).attr("href") !== undefined &&
                    $(element)
                    .attr("href")
                    .match(/^\/wiki\//g) ?
                    `https://zh.wikisource.org${$(element).attr("href")}` :
                    $(element).attr("href");
                wikiContentSeperateParagraph.push(
                    `<Udef_wiki Term="${$(
                        element
                    ).text()}" Url="${wikilink}">${$(
                        element
                    ).text()}<Udef_wiki>`
                );
            }
        });
    return wikiContentSeperateParagraph.join("\n");
}

export async function getExtendedLinks(wikiJson) {
    let wikiKeyword = [];
    if (Object.prototype.hasOwnProperty.call(wikiJson, "links")) {
        wikiJson.links.forEach((element) => {
            if (isEssensialKey(element["*"])) {
                wikiKeyword.push(element["*"]);
            }
        });
    }
    return wikiKeyword;
}

export function convertAlltoDocuments(wikiObjs, isAddHyperlink = true) {
    let eachDoc = "";
    let allDocs = [];
    wikiObjs.forEach((obj, index) => {
        let fullContext = obj.tempContent
            .map((x) =>
                isAddHyperlink ?
                composeXmlString(x.hyperlinks, "Paragraph", 1) :
                composeXmlString(x.paragraphs, "Paragraph", 1)
            )
            .join("\n");
        for (let docVal in obj.isImport) {
            eachDoc +=
                docVal == "doc_content" ?
                composeXmlString(fullContext, docVal, 1) :
                composeXmlString(obj.isImport[docVal], docVal);
        }
        allDocs.push(
            composeXmlString(
                eachDoc,
                "document",
                1,
                ` filename="${padding(index + 1, 3)}.txt"`
            )
        );
        eachDoc = "";
    });
    let final = endFile(allDocs.join("\n"));
    return final.replace(/^\r\n|^\n/gm, "");
}

export function convertAlltoParagraphs(wikiObjs, isAddHyperlink = true) {
    let allParagraphs = [];
    let eachDoc = "";
    wikiObjs.forEach((obj) => {
        allParagraphs.push(
            obj.tempContent
            .map((x) =>
                isAddHyperlink ?
                composeXmlString(x.hyperlinks, "Paragraph", 1) :
                composeXmlString(x.paragraphs, "Paragraph", 1)
            )
            .join("\n")
        );
    });

    allParagraphs = allParagraphs.join("\n");

    for (let docVal in wikiObjs[0].isImport) {
        eachDoc +=
            docVal == "doc_content" ?
            composeXmlString(allParagraphs, docVal, 1) :
            composeXmlString(wikiObjs[0].isImport[docVal], docVal);
    }

    let final = composeXmlString(
        eachDoc,
        "document",
        1,
        ` filename="${padding(1, 3)}.txt"`
    );
    return endFile(final).replace(/^\r\n|^\n/gm, "");
}

export function convertParagraphToDocuments(wikiObjs, isAddHyperlink = true) {
    let docs = [];
    let eachDoc = "";
    let count = 1;
    wikiObjs.forEach((obj) => {
        obj.tempContent.forEach((paraData) => {
            let eachWikiDoc = isAddHyperlink ?
                composeXmlString(paraData.hyperlinks, "Paragraph", 1) :
                composeXmlString(paraData.paragraphs, "Paragraph", 1);
            for (let docVal in obj.isImport) {
                eachDoc +=
                    docVal == "doc_content" ?
                    composeXmlString(eachWikiDoc, docVal, 1) :
                    composeXmlString(obj.isImport[docVal], docVal);
            }
            docs.push(
                composeXmlString(
                    eachDoc,
                    "document",
                    1,
                    ` filename="${padding(count, 3)}.txt"`
                )
            );
            eachDoc = "";
            count++;
        });
    });

    let final = endFile(docs.join("\n"));
    return final.replace(/^\r\n|^\n/gm, "");
}

export function endFile(data = "") {
    let corpusContent = `<corpus name="*">
<metadata_field_settings>
<author>作者</author>
<title>Wiki文本標題</title>
<doc_content>文本內容</doc_content>
</metadata_field_settings>
<feature_analysis>
<tag name="Udef_wiki" type="contentTagging" default_category="Udef_wiki" default_sub_category="-"/>
</feature_analysis>
</corpus>`;
    return `<?xml version="1.0"?>${composeXmlString(
        corpusContent + composeXmlString(data, "documents", 1),
        "ThdlPrototypeExport",
        1
    )}`;
}

export function padding(num, length) {
    for (var len = (num + "").length; len < length; len = num.length) {
        num = "0" + num;
    }
    return num;
}

export function isEssensialKey(text) {
    return text.match(
            /(Category.*)|(Author.*)|(Wikisource.*)|(Template.*)|(模块.*)/g
        ) ?
        false :
        true;
}

export function composeXmlString(source, xmlAttribute, isBreak = 0, addValue = "") {
    return isBreak == 0 ?
        `<${xmlAttribute}${addValue}>${source}</${xmlAttribute}>\n` :
        `<${xmlAttribute}${addValue}>${source}</${xmlAttribute}>`;
}


export function getWikiNum(json) {
    let target = "";
    for (const key in json) {
        if (/\d+/.test(key)) {
            target = key;
        }
    }
    // console.log(target);
    return target;
}

export async function getWikisourceJson(
    title,
    count,
    saveContent = {},
    tableContentsTemp
) {
    if (!("numOfDir" in saveContent)) {
        saveContent.numOfDir = 0;
    }
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&utf8",
            {
                params: {
                    titles: title,
                    origin: "*",
                },
            }
        );
        // console.log(`recusive來到：${recursionCount}`);
        // await sleep(300);
        apiBackJson = apiBackJson.data;
        // console.log(apiBackJson);
        let wikiDocNum = getWikiNum(apiBackJson.query.pages);
        let dirtyText = apiBackJson.query.pages[wikiDocNum].revisions[0]["*"];
        let wikiTitle = apiBackJson.query.pages[wikiDocNum].title;
        // console.log(dirtyText);
        let cleanText = dirtyText.match(/.*\[\[(\/*.*)\|*.*\]\]/gm);
        cleanText = cleanText
            .join("\n")
            .replace(/^\n/gm, "")
            .replace(/^\n/gm, "");
        cleanText = cleanText.match(/^[*#!].*\[\[(.*)\|*.*\]\]/gm);
        if (cleanText) {
            cleanText = cleanText.join("\n");

            cleanText = cleanText
                .replace(/.*\[\[(.*\/*.*)\|*.*\]\]/gm, "$1")
                .replace(/\|.*/gm, "");
            let wikiArrayCut = cleanText.split("\n");
            saveContent.numOfDir += wikiArrayCut.length;
            for (let i = 0; i < wikiArrayCut.length; i++) {
                saveContent.numOfDir--;
                if (/^\/.*/.test(wikiArrayCut[i])) {
                    wikiArrayCut[i] = wikiTitle + wikiArrayCut[i];
                }
                if (
                    tableContentsTemp.indexOf(wikiArrayCut[i]) == -1 &&
                    !/.*全覽.*/.test(wikiArrayCut[i])
                ) {
                    tableContentsTemp.push({
                        index: i,
                        value: wikiArrayCut[i],
                    });
                    // console.log(
                    //     `這是第${count}層，祖宗/title是${title},${wikiArrayCut[i]}\n`
                    // );
                    getWikisourceJson(
                        wikiArrayCut[i],
                        count + 1,
                        saveContent,
                        tableContentsTemp
                    );
                }
            }
            console.log(`目前的count來到：${saveContent.numOfDir}`);
            if (saveContent.numOfDir === 0) {
                tableContentsTemp = tableTreeGenerate(tableContentsTemp);
            }
        } else if (!cleanText && saveContent.numOfDir == 0) {
            tableContentsTemp.push({
                index: 0,
                value: title,
            });
            tableContentsTemp = tableTreeGenerate(tableContentsTemp);
        }
        return tableContentsTemp;
    } catch (error) {
        // console.log(error);
    }
}

export function tableTreeGenerate(wikis) {
    let items = wikis,
        result = [];
    items.forEach(function (path) {
        let logArray = path.value.split("/");
        logArray.reduce(function (level, key, index) {
            let temp = level.find(({ id }) => key === id);
            let isLeaf = true;
            if (!temp) {
                isLeaf = index === logArray.length ? true : false;
                temp = {
                    id: key,
                    label: key,
                    index: path.index,
                    value: "",
                    isLeaf: isLeaf,
                    children: [],
                };
                level.push(temp);
            }
            return temp.children;
        }, result);
    });
    treeIndexSort(result);
    return result;
}

export function treeIndexSort(resultTree, path = "", count = 1) {
    for (
        let iterTreeCount = 0;
        iterTreeCount < resultTree.length;
        iterTreeCount++
    ) {
        resultTree[iterTreeCount].index = count;
        resultTree[
            iterTreeCount
        ].id = `${path}/${resultTree[iterTreeCount].label}`.replace(/^\//, "");
        count++;
        if (resultTree[iterTreeCount].children.length !== 0) {
            count = treeIndexSort(
                resultTree[iterTreeCount].children,
                resultTree[iterTreeCount].id,
                count
            );
        } else {
            resultTree[iterTreeCount].isLeaf = true;
        }
    }
    return count;
}

export async function getSnippet(title) {
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php", {
                params: {
                    action: "parse",
                    page: title,
                    origin: "*",
                    format: "json",
                    utf8: "",
                },
            }
        );
        apiBackJson = apiBackJson.data.parse.text["*"];
        let doc = new DOMParser().parseFromString(apiBackJson, "text/html");
        let snip = $(doc)
            .find("div#headerContainer.ws-noexport.noprint table tbody tr td")
            .text();
        snip = snip
            .replace(/姊妹計劃.*/g, "")
            .replace(/版本信息.*/g, "")
            .replace(/(維基百科條目|维基百科條目).*/g, "");
        return snip;
    } catch (error) {
        console.log(error);
    }
}

export async function getWikiPage(title) {
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php", {
                params: {
                    action: "parse",
                    page: title,
                    origin: "*",
                    format: "json",
                    utf8: "",
                },
            }
        );
        console.log(apiBackJson.data.parse);
        return apiBackJson.data.parse;
    } catch (error) {
        console.log(error);
        alert(`請求出錯！`);
    }
}

export function splitAndUrlHandler(unCutContents) {
    let splitParagraphs = [];
    unCutContents.forEach((content) => {
        let useContent =
            content.isUrlAllow === true ?
            content.wikiText.hyperlinks :
            content.wikiText.paragraphs;
        let re = ``;
        if (content.paragraphCutWay === 2) {
            re = /\n/;
        } else if (content.paragraphCutWay === 3) {
            re = /####/;
        }
        let cutParas =
            re === `` ?
            [useContent] :
            useContent.split(re).filter((text) => text);
        console.log("print: ", cutParas);
        splitParagraphs.push({
            title: content.title,
            documents: cutParas,
        });
    });
    return splitParagraphs;
}

export function createMetadataRows(wikiFilesWithTitleAndDocuments) {
    let separateFiles = [];
    wikiFilesWithTitleAndDocuments.forEach((files) => {
        files.documents.forEach((document, index) => {
            separateFiles.push({
                title: `${files.title}/第${index}件`,
                corpus: "",
                author: "",
                doc_source: "",
                doc_topic_l1: "",
                doc_topic_l2: "",
                doc_topic_l3: "",
                geo_level1: "",
                geo_level2: "",
                geo_level3: "",
                geo_longitude: "",
                geo_latitude: "",
                doc_category_l1: "",
                doc_category_l2: "",
                doc_category_l3: "",
                docclass: "",
                docclass_aux: "",
                doctype: "",
                doctype_aux: "",
                book_code: "",
                time_orig_str: "",
                time_varchar: "",
                time_norm_year: "",
                era: "",
                time_norm_kmark: "",
                year_for_grouping: "",
                time_dynasty: "",
                doc_seq_number: "",
                timeseq_not_before: "",
                timeseq_not_after: "",
                doc_attachment: "",
                doc_att_caption:"",
                doc_content: document,
            });
        });
    });
    return separateFiles;
}

export function splitAriaConvert(pureTextWithCutVal, urlVal) {
    let splitStrings = urlVal.match(
        /.{2}<Udef_wiki[^<]*>[^<]*<\/Udef_wiki>.{2}/g
    );
    if (splitStrings === null) return;

    let waitToAddUrlText = pureTextWithCutVal;
    splitStrings.forEach((url) => {
        let cleanUrlText = url.replace(
            /(.{2})<Udef_wiki[^<]*>([^<]*)<\/Udef_wiki>(.{2})/,
            "$1$2$3"
        );
        waitToAddUrlText = waitToAddUrlText.replace(cleanUrlText, url);
    });
    return waitToAddUrlText;
}


