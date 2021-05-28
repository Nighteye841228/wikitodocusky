<template>
    <div>
        <div class="content">
            <b-button class="is-primary" outlined expanded @click="isOpenBook = true">{{ title }}/第{{index}}件
            </b-button>
        </div>
        <b-modal v-model="isOpenBook" :width="1000" scroll="keep">
            <div class="card">
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <p class="title is-4">{{ title }}/第{{index}}件</p>
                        </div>
                    </div>
    
                    <textarea class="textarea" v-text="document" rows="20"></textarea>
                </div>
                <footer class="modal-card-foot">
                </footer>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: 'SplitCompleteContent',
    data: function() {
        return {
            isOpenBook: false,
        };
    },
    props: ["document", "index", "title"],
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
