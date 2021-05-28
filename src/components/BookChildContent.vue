<template>
    <div>
        <div class="content">
            <b-button class="is-primary" outlined expanded @click="isOpenBook = true">{{ wikiBook }}
            </b-button>
        </div>
        <b-modal v-model="isOpenBook" :width="1000" scroll="keep">
            <div class="card">
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <p class="title is-4">獲取的WikiSource文本內容</p>
                        </div>
                    </div>
    
                    <textarea class="textarea" placeholder="10 lines of textarea" v-model.lazy="pureText" rows="20"></textarea>
    
                </div>
                <footer class="modal-card-foot">
                    <section>
                        <label class="checkbox">
                                            <input type="checkbox" v-model="isUrlAllow">
                                            是否保存超連結
                                        </label>
                        <div class="block">
                            <b-radio name="name" native-value="1" v-model.number="paragraphCutWay">
                                以此卷作為一件
                            </b-radio>
                            <b-radio name="name" native-value="2" v-model.number="paragraphCutWay">
                                以段落切開作為一件
                            </b-radio>
                            <b-radio name="name" native-value="3" v-model.number="paragraphCutWay">
                                以自由分段作為分件（以####作為語法輸入）
                            </b-radio>
                            <b-button type="is-success" outlined @click="sendWikiCutObj">確認分段</b-button>
                        </div>
                    </section>
                </footer>
            </div>
        </b-modal>
    </div>
</template>

<script>
import {
    parseHtmlText,
    getWikiPage,
    splitAriaConvert,
} from '../tool.js';

export default {
    name: 'BookChildContent',
    data: function() {
        return {
            isOpenBook: false,
            paragraphCutWay: 1,
            wikiObj: {},
            wikiText: {
                paragraphs: "",
                hyperlinks: "",
            },
            isUrlAllow: false,
            isViewed: false,
        };
    },
    props: ["value", "wikiBook", "order"],
    methods: {
        sendWikiCutObj: function() {
            this.$emit("handle-wiki", {
                title: this.wikiBook,
                order: this.order,
                paragraphCutWay: this.paragraphCutWay,
                isUrlAllow: this.isUrlAllow,
                wikiText: {
                    paragraphs: this.pureText,
                    hyperlinks: this.wikiText.hyperlinks,
                },
            });
            this.isOpenBook = false;
            this.isViewed = true;
        },
    },
    computed: {
        pureText: {
            get: function() {
                return this.wikiText.hyperlinks.replace(
                    /\n*<Udef_wiki[^<]*>\n*([^<]*)\n*<\/Udef_wiki>\n*/gm,
                    "$1"
                );
            },
            set: function(val) {
                this.wikiText.hyperlinks = splitAriaConvert(
                    val,
                    this.wikiText.hyperlinks
                );
            },
        },
    },
    created: async function() {
        console.log("進入偵測！");
        this.wikiObj = await getWikiPage(this.wikiBook);
        this.wikiText = parseHtmlText(this.wikiObj.text["*"]);
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
