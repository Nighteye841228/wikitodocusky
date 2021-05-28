const columnDefinition = [{
    field: 'title',
    headerName: '文件標題',
    editable: true,
  },
  {
    field: 'corpus',
    headerName: '文獻集名稱',
    editable: true,
  },
  {
    field: 'author',
    headerName: '文件作者',
    editable: true,
  },
  {
    field: 'doc_source',
    headerName: '文件來源',
    editable: true,
  },
  {
    field: 'doc_topic_l1',
    headerName: '文件主題階層一',
    editable: true,
  },
  {
    field: 'doc_topic_l2',
    headerName: '文件主題階層二',
    editable: true,
  },
  {
    field: 'doc_topic_l3',
    headerName: '文件主題階層三',
    editable: true,
  },
  {
    field: 'geo_level1',
    headerName: '文件地域階層一',
    editable: true,
  },
  {
    field: 'geo_level2',
    headerName: '文件地域階層二',
    editable: true,
  },
  {
    field: 'geo_level3',
    headerName: '文件地域階層三',
    editable: true,
  },
  {
    field: 'geo_longitude',
    headerName: '文件所在經度',
    editable: true,
  },
  {
    field: 'geo_latitude',
    headerName: '文件所在緯度',
    editable: true,
  },
  {
    field: 'doc_category_l1',
    headerName: '文件分類階層一',
    editable: true,
  },
  {
    field: 'doc_category_l2',
    headerName: '文件分類階層二',
    editable: true,
  },
  {
    field: 'doc_category_l3',
    headerName: '文件分類階層三',
    editable: false,
  },
  {
    field: 'docclass',
    headerName: '文件類別',
    editable: true,
  },
  {
    field: 'docclass_aux',
    headerName: '文件子類別',
    editable: true,
  },
  {
    field: 'doctype',
    headerName: '文件型態',
    editable: true,
  },
  {
    field: 'doctype_aux',
    headerName: '文件子型態',
    editable: true,
  },
  {
    field: 'book_code',
    headerName: '文件書碼',
    editable: true,
  },
  {
    field: 'time_orig_str',
    headerName: '文件時間(字串)',
    editable: true,
  },
  {
    field: 'time_varchar',
    headerName: '文件時間(西曆)',
    editable: true,
  },
  {
    field: 'time_norm_year',
    headerName: '文件時間(中曆)',
    editable: true,
  },
  {
    field: 'era',
    headerName: '文件時間(年號)',
    editable: true,
  },
  {
    field: 'time_norm_kmark',
    headerName: '文件時間(帝號)',
    editable: true,
  },
  {
    field: 'year_for_grouping',
    headerName: '文件時間(西元年)',
    editable: true,
  },
  {
    field: 'time_dynasty',
    headerName: '文件時間(朝代)',
    editable: true,
  },
  {
    field: 'doc_seq_number',
    headerName: '文件順序',
    editable: true,
  },
  {
    field: 'timeseq_not_before',
    headerName: '文件起始時間',
    editable: true,
  },
  {
    field: 'timeseq_not_after',
    headerName: '文件結束時間',
    editable: true,
  },
  {
    field: 'doc_attachment',
    headerName: '文件圖檔',
    editable: true,
  },
  {
    field: 'doc_att_caption',
    headerName: '文件圖檔的圖說',
    editable: true,
  },
];

const colHeader = ['文件標題',
  '文獻集名稱',
  '文件作者',
  '文件來源',
  '文件主題階層一',
  '文件主題階層二',
  '文件主題階層三',
  '文件地域階層一',
  '文件地域階層二',
  '文件地域階層三',
  '文件所在經度',
  '文件所在緯度',
  '文件分類階層一',
  '文件分類階層二',
  '文件分類階層三',
  '文件類別',
  '文件子類別',
  '文件型態',
  '文件子型態',
  '文件書碼',
  '文件時間(字串)',
  '文件時間(西曆)',
  '文件時間(中曆)',
  '文件時間(年號)',
  '文件時間(帝號)',
  '文件時間(西元年)',
  '文件時間(朝代)',
  '文件順序',
  '文件起始時間',
  '文件結束時間',
  '文件圖檔',
  '文件圖檔的圖說',
  '文件內容'
]

const columns= [
  {wordWrap:false}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {wordWrap:false, width:"150px"}
];

export {
  columnDefinition,
  colHeader,
  columns
};