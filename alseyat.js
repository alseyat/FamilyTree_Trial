// =========================================================
//  شجرة أسرة السياط — بيانات الأفراد
//
//  كيفية إضافة شخص جديد:
//  ───────────────────────
//  1. أضف سطراً جديداً في قسم "بيانات الأسرة" أدناه
//  2. اختر id فريداً (أكبر رقم موجود + 1)
//  3. اكتب الاسم في name
//  4. في parentId ضع id والده
//
//  مثال — لإضافة "علي" ابناً لمن id والده 45:
//  { id: 260, name: "علي", parentId: 45 },
//
//  ملاحظة: الجد الأول parentId: null
// =========================================================

// ── بيانات الأسرة ─────────────────────────────────────────
const people = [
  { id:   1, name: "سياط", parentId: null, deceased: true },
    // { id:   1, name: "سياط", death: "",  parentId: null, deceased: true },


  // أبناء سياط (id: 1)
  { id:   2, name: "سالم",  parentId: 1, deceased: true },

  // أبناء سالم (id: 2)
  { id:   3, name: "عودة",  parentId: 2, deceased: true },
  { id:   4, name: "خلف",  parentId: 2, deceased: true },

  // أبناء سياط (id: 1)
  { id:   5, name: "مختار",  parentId: 1, deceased: true },

  // أبناء مختار (id: 5)
  { id:   6, name: "حمود",  parentId: 5, deceased: true },

  // أبناء حمود (id: 6)
  { id:   7, name: "راشد",  parentId: 6, deceased: true },

  // أبناء راشد (id: 7)
  { id:   8, name: "بريكان",  parentId: 7, deceased: true },

  // أبناء بريكان (id: 8)
  { id:   9, name: "مزيد",  parentId: 8, deceased: true },

  // أبناء مزيد (id: 9)
  { id:  10, name: "حماد",  parentId: 9, deceased: true },
  { id:  11, name: "راشد",  parentId: 9, deceased: true },

  // أبناء بريكان (id: 8)
  { id:  12, name: "زيدان",  parentId: 8, deceased: true },

  // أبناء زيدان (id: 12)
  { id:  13, name: "أحمد",  parentId: 12, deceased: true },
  { id:  14, name: "علي",  parentId: 12, deceased: true },

  // أبناء بريكان (id: 8)
  { id:  15, name: "زيد",  parentId: 8, deceased: true },

  // أبناء زيد (id: 15)
  { id:  16, name: "حمود",  parentId: 15, deceased: true },
  { id:  17, name: "حسين",  parentId: 15, deceased: true },

  // أبناء بريكان (id: 8)
  { id:  18, name: "سليمان",  parentId: 8, deceased: true },

  // أبناء سليمان (id: 18)
  { id:  19, name: "مرزوق",  parentId: 18, deceased: true },

  // أبناء مرزوق (id: 19)
  { id:  20, name: "مسفر",  parentId: 19, deceased: true },

  // أبناء مسفر (id: 20)
  { id:  21, name: "موسى",  parentId: 20, deceased: true },

  // أبناء مرزوق (id: 19)
  { id:  22, name: "حماد",  parentId: 19, deceased: true },

  // أبناء حماد (id: 22)
  { id:  23, name: "مطير",  parentId: 22, deceased: true },

  // أبناء مطير (id: 23)
  { id:  24, name: "موسى",  parentId: 23, deceased: true },
  { id:  25, name: "يوسف",  parentId: 23, deceased: true },

  // أبناء مرزوق (id: 19)
  { id:  26, name: "عجاج",  parentId: 19, deceased: true },
  { id:  77, name: "عجب",  parentId: 19, deceased: true },

  // أبناء عجاج (id: 26)
  { id:  27, name: "علي",  parentId: 26, deceased: true },

  // أبناء علي (id: 27)
  { id:  28, name: "ماشي",  parentId: 27, deceased: true },
  { id:  29, name: "محمد", death: "13 ربيع الأول 1436 هـ - 4 يناير 2015 م", portrait: 29,  parentId: 27 },

  // أبناء محمد (id: 29)
  { id:  30, name: "مرزوق",  parentId: 29 },

  // أبناء مرزوق (id: 30)
  { id:  31, name: "عبدالعزيز",  parentId: 30 },

  // أبناء عبدالعزيز (id: 31)
  { id:  32, name: "مرزوق",  parentId: 31 },

  // أبناء مرزوق (id: 30)
  { id:  33, name: "حاتم",  parentId: 30 },

  // أبناء حاتم (id: 33)
  { id:  34, name: "شهاب",  parentId: 33 },
  { id:  35, name: "عبدالعزيز",  parentId: 33 },
  { id:  36, name: "سليمان",  parentId: 33 },
  { id:  37, name: "عدي",  parentId: 33 },

  // أبناء مرزوق (id: 30)
  { id:  38, name: "محمد",  parentId: 30 },

  // أبناء محمد (id: 38)
  { id:  39, name: "بتال",  parentId: 38 },
  { id:  40, name: "عاصف",  parentId: 38 },
  { id:  41, name: "سياط",  parentId: 38 },

  // أبناء محمد (id: 29)
  { id:  42, name: "سليمان", death: "15 جمادى الآخرة 1438 هـ - 14 مارس 2017 م", portrait: 42,  parentId: 29 },
  // { id:  42, name: "سليمان", death: "15 / 6 / 1438 هـ - 14 / 3 / 2017 م", portrait: 42,  parentId: 29 },

  // أبناء سليمان (id: 42)
  { id:  43, name: "خالد",  parentId: 42 },

  // أبناء خالد (id: 43)
  { id:  44, name: "سليمان",  parentId: 43 },

  // أبناء سليمان (id: 42)
  { id:  45, name: "فهد",  parentId: 42 },

  // أبناء فهد (id: 45)
  { id:  46, name: "عجاج",  parentId: 45 },

  // أبناء سليمان (id: 42)
  { id:  47, name: "نايف",  parentId: 42 },

  // أبناء نايف (id: 47)
  { id:  48, name: "خالد",  parentId: 47 },

  // أبناء سليمان (id: 42)
  { id:  49, name: "أحمد",  parentId: 42 },

  // أبناء أحمد (id: 49)
  { id:  50, name: "فهد",  parentId: 49 },
  { id:  51, name: "مقرن",  parentId: 49 },

  // أبناء سليمان (id: 42)
  { id:  52, name: "عبدالله",  parentId: 42 },
  { id:  53, name: "عبدالرحمن",  parentId: 42 },

  // أبناء عبدالرحمن (id: 53)
  { id:  54, name: "نايف",  parentId: 53 },

  // أبناء محمد (id: 29)
  { id:  55, name: "يوسف", death: "25 محرم 1447 هـ - 20 يوليو 2025 م", portrait: 55,  parentId: 29 },
  // { id:  55, name: "يوسف", death: "25 / 1 / 1447 هـ - 20 / 7 / 2025 م", portrait: 55,  parentId: 29 },

  // أبناء يوسف (id: 55)
  { id:  56, name: "محمد",  parentId: 55 },
  { id:  57, name: "إبراهيم",  parentId: 55 },

  // أبناء إبراهيم (id: 57)
  { id:  58, name: "عجاج",  parentId: 57 },

  // أبناء محمد (id: 29)
  { id:  59, name: "إبراهيم",  parentId: 29 },

  // أبناء إبراهيم (id: 59)
  { id:  60, name: "نواف",  parentId: 59 },

  // أبناء نواف (id: 60)
  { id:  61, name: "إبراهيم",  parentId: 60 },
  { id:  62, name: "ضاري",  parentId: 60 },

  // أبناء إبراهيم (id: 59)
  { id:  63, name: "نايف",  parentId: 59 },

  // أبناء نايف (id: 63)
  { id:  64, name: "نواف",  parentId: 63 },
  { id:  65, name: "مطلق",  parentId: 63 },

  // أبناء إبراهيم (id: 59)
  { id:  66, name: "صالح",  parentId: 59 },
  { id:  67, name: "أحمد",  parentId: 59 },

  // أبناء محمد (id: 29)
  { id:  68, name: "صالح",  parentId: 29 },

  // أبناء صالح (id: 68)
  { id:  69, name: "غيث",  parentId: 68 },
  { id:  70, name: "حاتم",  parentId: 68 },
  { id:  71, name: "مرزوق",  parentId: 68 },
  { id:  72, name: "هتان",  parentId: 68 },

  // أبناء محمد (id: 29)
  { id:  73, name: "علي",  parentId: 29 },

  // أبناء علي (id: 73)
  { id:  74, name: "ريان",  parentId: 73 },
  { id:  75, name: "سلامة",  parentId: 73 },
  { id:  76, name: "بدر",  parentId: 73 },


  // أبناء عجب (id: 77)
  { id:  78, name: "سميحان", death: "1377 هـ - 1957 / 1958 م", portrait: 78,  parentId: 77 },

  // أبناء سميحان (id: 78)
  { id:  79, name: "سعود",  parentId: 78 },

  // أبناء سعود (id: 79)
  { id:  80, name: "طارق",  parentId: 79 },
  { id:  81, name: "هاني",  parentId: 79 },

  // أبناء هاني (id: 81)
  { id:  82, name: "معاذ",  parentId: 81 },
  { id:  83, name: "أسامة",  parentId: 81 },
  { id:  84, name: "معتز",  parentId: 81 },
  { id:  85, name: "مشاري",  parentId: 81 },

  // أبناء سعود (id: 79)
  { id:  86, name: "هيثم",  parentId: 79 },

  // أبناء هيثم (id: 86)
  { id:  87, name: "عبدالعزيز",  parentId: 86 },
  { id:  88, name: "سعود",  parentId: 86 },

  // أبناء سعود (id: 79)
  { id:  89, name: "أسامة",  parentId: 79 },
  { id:  90, name: "سامي",  parentId: 79 },

  // أبناء سامي (id: 90)
  { id:  91, name: "نايف",  parentId: 90 },
  { id:  92, name: "سعود",  parentId: 90 },
  { id:  93, name: "خالد",  parentId: 90 },

  // أبناء سعود (id: 79)
  { id:  94, name: "أنس", portrait: 94,  parentId: 79 },

  // أبناء أنس (id: 94)
  { id:  95, name: "سلام",  parentId: 94 },

  // أبناء سعود (id: 79)
  { id:  96, name: "عاصم",  parentId: 79 },
  { id:  97, name: "مصعب",  parentId: 79 },

  // أبناء سميحان (id: 78)
  { id:  98, name: "صالح", death: "5 ربيع الأول 1442 هـ - 22 أكتوبر 2020 م", portrait: 98,  parentId: 78 },
  // { id:  98, name: "صالح", death: "5 / 3 / 1442 هـ - 22 / 10 / 2020 م",  parentId: 78 },

  // أبناء صالح (id: 98)
  { id:  99, name: "محمد",  parentId: 98 },

  // أبناء محمد (id: 99)
  { id: 100, name: "عبدالرحمن",  parentId: 99 },

  // أبناء صالح (id: 98)
  { id: 101, name: "هشام",  parentId: 98 },
  { id: 102, name: "معتصم",  parentId: 98 },
  { id: 103, name: "عبدالملك",  parentId: 98 },

  // أبناء عجب (id: 77)
  { id: 104, name: "سحيمان", death: "", portrait: 104,  parentId: 77 },

  // أبناء سحيمان (id: 104)
  { id: 105, name: "موسى", death: "26 شعبان 1446 هـ - 25 فبراير 2025 م", portrait: 105,  parentId: 104 },
  // { id: 105, name: "موسى", death: "26 / 8 / 1446 هـ - 25 / 2 / 2025 م", portrait: 105,  parentId: 104 },

  { id: 106, name: "عبدالله", death: "10 جمادى الآخرة 1431 هـ - 24 مايو 2010 م", portrait: 106,  parentId: 104 },
  { id: 107, name: "علي", death: "28 ذو القعدة 1430 هـ - 16 نوفمبر 2009 م", portrait: 107,  parentId: 104 },

  // أبناء علي (id: 107)
  { id: 108, name: "حسين",  parentId: 107 },
  { id: 109, name: "موسى",  parentId: 107 },
  { id: 110, name: "عبدالله",  parentId: 107 },

  // أبناء سحيمان (id: 104)
  { id: 111, name: "عبدالرحمن", death: "4 ربيع الأول 1442 هـ - 21 أكتوبر 2020 م", portrait: 111,  parentId: 104 },
  // { id: 111, name: "عبدالرحمن", death: "4 / 3 / 1442 هـ - 21 / 10 / 2020 م",  parentId: 104 },

  // أبناء سليمان (id: 18)
  { id: 112, name: "سالم",  parentId: 18, deceased: true },

  // أبناء سالم (id: 112)
  { id: 113, name: "فارس",  parentId: 112, deceased: true },

  // أبناء فارس (id: 113)
  { id: 114, name: "مطلق",  parentId: 113, deceased: true },

  // أبناء مطلق (id: 114)
  { id: 115, name: "أحمد",  parentId: 114, deceased: true },

  // أبناء فارس (id: 113)
  { id: 116, name: "فهيد",  parentId: 113, deceased: true },

  // أبناء سالم (id: 112)
  { id: 117, name: "عطاالله",  parentId: 112, deceased: true },

  // أبناء عطاالله (id: 117)
  { id: 118, name: "عواد", death: "", portrait: 118,  parentId: 117 },

  // أبناء عواد (id: 118)
  { id: 119, name: "عطاالله",  parentId: 118 },

  // أبناء عطاالله (id: 119)
  { id: 120, name: "إبراهيم",  parentId: 119 },

  // أبناء إبراهيم (id: 120)
  { id: 121, name: "أحمد",  parentId: 120 },
  { id: 122, name: "طارق",  parentId: 120 },
  { id: 123, name: "حاتم",  parentId: 120 },

  // أبناء عطاالله (id: 119)
  { id: 124, name: "خليل",  parentId: 119 },

  // أبناء خليل (id: 124)
  { id: 125, name: "محمد",  parentId: 124 },
  { id: 126, name: "عبدالله",  parentId: 124 },
  { id: 127, name: "ماجد",  parentId: 124 },

  // أبناء عطاالله (id: 119)
  { id: 128, name: "ماجد",  parentId: 119 },

  // أبناء ماجد (id: 128)
  { id: 129, name: "فارس",  parentId: 128 },
  { id: 130, name: "باسل",  parentId: 128 },
  { id: 131, name: "سيف",  parentId: 128 },

  // أبناء عطاالله (id: 119)
  { id: 132, name: "عواد",  parentId: 119 },

  // أبناء عواد (id: 132)
  { id: 133, name: "راكان",  parentId: 132 },

  // أبناء سالم (id: 112)
  { id: 134, name: "حنيظل",  parentId: 112, deceased: true },

  // أبناء حنيظل (id: 134)
  { id: 135, name: "سليمان",  parentId: 134, deceased: true },
  { id: 136, name: "سلمان",  parentId: 134, deceased: true },

  // أبناء سلمان (id: 136)
  { id: 137, name: "هلال", death: "9 جمادى الآخرة 1417 هـ - 22 أكتوبر 1996 م", portrait: 137,  parentId: 136 },

  // أبناء هلال (id: 137)
  { id: 138, name: "سلمان", death: "29 ربيع الأول 1421 هـ - 2 يوليو 2000 م", portrait: 138,  parentId: 137 },

  // أبناء سلمان (id: 138)
  { id: 139, name: "أديب",  parentId: 138 },

  // أبناء أديب (id: 139)
  { id: 140, name: "سلمان",  parentId: 139 },
  { id: 141, name: "سياط",  parentId: 139 },
  { id: 142, name: "سامي",  parentId: 139 },

  // أبناء سلمان (id: 138)
  { id: 143, name: "أمجد",  parentId: 138 },

  // أبناء أمجد (id: 143)
  { id: 144, name: "سلمان",  parentId: 143 },
  { id: 145, name: "عبدالرحمن",  parentId: 143 },

  // أبناء سلمان (id: 138)
  { id: 146, name: "مجدي",  parentId: 138 },

  // أبناء مجدي (id: 146)
  { id: 147, name: "عبدالعزيز",  parentId: 146 },

  // أبناء سلمان (id: 138)
  { id: 148, name: "ماجد",  parentId: 138 },

  // أبناء ماجد (id: 148)
  { id: 149, name: "أصيل",  parentId: 148 },
  { id: 150, name: "ريان",  parentId: 148 },
  { id: 151, name: "غيث",  parentId: 148 },

  // أبناء سلمان (id: 138)
  { id: 152, name: "عبدالمجيد",  parentId: 138 },

  // أبناء عبدالمجيد (id: 152)
  { id: 153, name: "سلمان",  parentId: 152 },
  { id: 154, name: "فارس",  parentId: 152 },

  // أبناء سلمان (id: 138)
  { id: 155, name: "محمد",  parentId: 138 },
  { id: 156, name: "أحمد",  parentId: 138 },

  // أبناء هلال (id: 137)
  { id: 157, name: "عبدالرحمن", death: "20 ذو القعدة 1443 هـ - 19 يونيو 2022 م", portrait: 157,  parentId: 137 },
  // { id: 157, name: "عبدالرحمن", death: "20 / 11 / 1443 هـ - 19 / 6 / 2022 م",  parentId: 137 },

  // أبناء عبدالرحمن (id: 157)
  { id: 158, name: "حسام",  parentId: 157 },
  { id: 159, name: "سامر",  parentId: 157 },

  // أبناء سامر (id: 159)
  { id: 160, name: "يوسف",  parentId: 159 },

  // أبناء عبدالرحمن (id: 157)
  { id: 161, name: "باسم",  parentId: 157 },

  // أبناء هلال (id: 137)
  { id: 162, name: "يوسف",  parentId: 137 },

  // أبناء يوسف (id: 162)
  { id: 163, name: "مهند",  parentId: 162 },
        { id: 1631, name: "يوسف",  parentId: 163 },
  { id: 164, name: "هلال",  parentId: 162 },

  // أبناء هلال (id: 137)
  { id: 165, name: "موسى",  parentId: 137 },

  // أبناء موسى (id: 165)
  { id: 166, name: "أحمد",  parentId: 165 },

  // أبناء أحمد (id: 166)
  { id: 167, name: "مشعل",  parentId: 166 },
  { id: 168, name: "عبدالله",  parentId: 166 },
  { id: 169, name: "سطام",  parentId: 166 },

  // أبناء موسى (id: 165)
  { id: 170, name: "عبدالله", death: "27 رمضان 1434 هـ - 4 أغسطس 2013 م",  parentId: 165 },
  // { id: 170, name: "عبدالله", death: "27 / 9 / 1434 هـ - 4 / 8 / 2013 م",  parentId: 165 },

  { id: 171, name: "محمد",  parentId: 165 },
    // أبناء محمد (id: 171)
  { id: 172, name: "عبدالله",  parentId: 171 },
    { id: 1711, name: "بندر",  parentId: 171 },


  // أبناء موسى (id: 165)
  { id: 173, name: "خالد",  parentId: 165 },

  // أبناء هلال (id: 137)
  { id: 174, name: "محمد",  parentId: 137 },

  // أبناء محمد (id: 174)
  { id: 175, name: "خالد",  parentId: 174 },

  // أبناء خالد (id: 175)
  { id: 176, name: "أحمد",  parentId: 175 },

  // أبناء محمد (id: 174)
  { id: 177, name: "فيصل",  parentId: 174 },
  { id: 178, name: "نواف",  parentId: 174 },

  // أبناء هلال (id: 137)
  { id: 179, name: "بدر",  parentId: 137 },

  // أبناء بدر (id: 179)
  { id: 180, name: "هلال",  parentId: 179 },

  // أبناء حنيظل (id: 134)
  { id: 181, name: "محمد",  parentId: 134, deceased: true },

  // أبناء محمد (id: 181)
  { id: 182, name: "حمود", death: "24 ذو القعدة 1421 هـ - 18 فبراير 2001 م", portrait: 182,  parentId: 181 },

  // أبناء حمود (id: 182)
  { id: 183, name: "عبدالهادي",  parentId: 182 },

  // أبناء عبدالهادي (id: 183)
  { id: 184, name: "تركي",  parentId: 183 },

  // أبناء تركي (id: 184)
  { id: 185, name: "نايف",  parentId: 184 },
  { id: 1851, name: "فهد",  parentId: 184 },

  // أبناء عبدالهادي (id: 183)
  { id: 186, name: "سلطان",  parentId: 183 },

  // أبناء حمود (id: 182)
  { id: 187, name: "عبدالرحمن",  parentId: 182 },

  // أبناء عبدالرحمن (id: 187)
  { id: 188, name: "مشاري",  parentId: 187 },

  // أبناء مشاري (id: 188)
  { id: 189, name: "عبدالعزيز",  parentId: 188 },

  // أبناء عبدالرحمن (id: 187)
  { id: 190, name: "عبدالعزيز",  parentId: 187 },
  { id: 191, name: "سعود",  parentId: 187 },
  { id: 192, name: "حمود",  parentId: 187 },
  { id: 193, name: "فيصل",  parentId: 187 },

  // أبناء محمد (id: 181)
  { id: 194, name: "الحميدي", death: "6 ذو الحجة 1434 هـ - 11 أكتوبر 2013 م", portrait: 194,  parentId: 181 },
  // { id: 194, name: "الحميدي", death: "6 / 12 / 1434 هـ - 11 / 10 / 2013 م", portrait: 194,  parentId: 181 },

  // أبناء الحميدي (id: 194)
  { id: 195, name: "عبدالله",  parentId: 194 },

  // أبناء عبدالله (id: 195)
  { id: 196, name: "سياط", death: "",  parentId: 195 },
  { id: 197, name: "محمد",  parentId: 195 },
  { id: 198, name: "يوسف",  parentId: 195 },

  // أبناء الحميدي (id: 194)
  { id: 199, name: "محمد",  parentId: 194 },

  // أبناء محمد (id: 199)
  { id: 200, name: "نواف",  parentId: 199 },
  { id: 201, name: "عبدالله",  parentId: 199 },
  { id: 202, name: "معن",  parentId: 199 },
  { id: 203, name: "فيصل",  parentId: 199 },

  // أبناء الحميدي (id: 194)
  { id: 204, name: "خالد",  parentId: 194 },

  // أبناء خالد (id: 204)
  { id: 205, name: "عاطف",  parentId: 204 },

  // أبناء الحميدي (id: 194)
  { id: 206, name: "بدر",  parentId: 194 },

  // أبناء بدر (id: 206)
  { id: 207, name: "عبدالله",  parentId: 206 },
  { id: 208, name: "محمد",  parentId: 206 },

  // أبناء حنيظل (id: 134)
  { id: 209, name: "خميس",  parentId: 134, deceased: true },

  // أبناء خميس (id: 209)
  { id: 210, name: "عطا", death: "18 ربيع الثاني 1444 هـ - 12 نوفمبر 2022 م", portrait: 210, parentId: 209 },
  // { id: 210, name: "عطا", death: "18 / 4 / 1444 هـ - 12 / 11 / 2022 م", portrait: 210, parentId: 209 },

  // أبناء عطاء (id: 210)
  { id: 211, name: "عبدالله",  parentId: 210 },

  // أبناء عبدالله (id: 211)
  { id: 212, name: "فيصل",  parentId: 211 },
  { id: 213, name: "مساعد",  parentId: 211 },

  // أبناء عطاء (id: 210)
  { id: 214, name: "خالد",  parentId: 210 },

  // أبناء خالد (id: 214)
  { id: 215, name: "وليد",  parentId: 214 },
  { id: 216, name: "معاذ",  parentId: 214 },

  // أبناء عطاء (id: 210)
  { id: 217, name: "خميس",  parentId: 210 },

  // أبناء خميس (id: 217)
  { id: 218, name: "إلياس",  parentId: 217 },
  { id: 219, name: "ساري",  parentId: 217 },

  // أبناء عطاء (id: 210)
  { id: 220, name: "أيمن",  parentId: 210 },

  // أبناء أيمن (id: 220)
  { id: 221, name: "حاتم",  parentId: 220 },

  // أبناء عطاء (id: 210)
  { id: 222, name: "محمد",  parentId: 210 },

  // أبناء محمد (id: 222)
  { id: 223, name: "عبدالعزيز",  parentId: 222 },
  { id: 224, name: "عمر",  parentId: 222 },
  { id: 225, name: "حمد",  parentId: 222 },
  { id: 226, name: "عبدالملك",  parentId: 222 },

  // أبناء عطاء (id: 210)
  { id: 227, name: "عادل",  parentId: 210 },
  { id: 228, name: "أحمد",  parentId: 210 },

  // أبناء أحمد (id: 228)
  { id: 229, name: "روّاف",  parentId: 228 },
  { id: 230, name: "ريّاف",  parentId: 228 },

  // أبناء عطاء (id: 210)
  { id: 231, name: "أشرف",  parentId: 210 },

  // أبناء أشرف (id: 231)
  { id: 232, name: "مشعل",  parentId: 231 },

  // أبناء خميس (id: 209)
  { id: 233, name: "ونيس", death: "", portrait: 233,  parentId: 209 },

  // أبناء ونيس (id: 233)
  { id: 234, name: "ونيس",  parentId: 233 },

  // أبناء ونيس (id: 234)
  { id: 235, name: "أحمد",  parentId: 234 },

  // أبناء أحمد (id: 235)
  { id: 236, name: "سياط",  parentId: 235 },
  { id: 237, name: "يزيد",  parentId: 235 },
  { id: 238, name: "عبدالله",  parentId: 235 },

  // أبناء ونيس (id: 234)
  { id: 239, name: "محمد",  parentId: 234 },

  // أبناء محمد (id: 239)
  { id: 240, name: "سلطان",  parentId: 239 },
  { id: 241, name: "أكرم",  parentId: 239 },

  // أبناء ونيس (id: 234)
  { id: 242, name: "عبدالعزيز",  parentId: 234 },

  // أبناء عبدالعزيز (id: 242)
  { id: 243, name: "فارس",  parentId: 242 },
  { id: 244, name: "روّاف",  parentId: 242 },

  // أبناء ونيس (id: 234)
  { id: 245, name: "خالد",  parentId: 234 },
  { id: 246, name: "نواف",  parentId: 234 },
  { id: 247, name: "أكرم",  parentId: 234 },

  // أبناء خميس (id: 209)
  { id: 248, name: "عبدالله",  parentId: 209, deceased: true },

  // أبناء حنيظل (id: 134)
  { id: 249, name: "فويران",  parentId: 134, deceased: true },

  // أبناء سالم (id: 112)
  { id: 250, name: "حنظول",  parentId: 112, deceased: true },

  // أبناء بريكان (id: 8)
  { id: 251, name: "فهيد",  parentId: 8, deceased: true },

  // أبناء فهيد (id: 251)
  { id: 252, name: "صالح",  parentId: 251, deceased: true },

  // أبناء بريكان (id: 8)
  { id: 253, name: "فهد",  parentId: 8, deceased: true },

  // أبناء فهد (id: 253)
  { id: 254, name: "فهاد",  parentId: 253, deceased: true },
  { id: 255, name: "عواد",  parentId: 253, deceased: true },

  // أبناء راشد (id: 7)
  { id: 256, name: "مطلق",  parentId: 7, deceased: true },

  // أبناء حمود (id: 6)
  { id: 257, name: "فهيد",  parentId: 6, deceased: true },

  // أبناء مختار (id: 5)
  { id: 258, name: "سلمان",  parentId: 5, deceased: true },

  // أبناء سياط (id: 1)
  { id: 259, name: "حماد",  parentId: 1, deceased: true },
];

// =========================================================
//  دالة البناء — لا تعدّل هذا القسم
//  تحوّل القائمة أعلاه تلقائياً إلى الشجرة المتداخلة
// =========================================================
function buildTree(list) {
  const map = {};
  list.forEach(p => {
    const node = { name: p.name, children: [] };
    if (p.death !== undefined) node.death = p.death;
    if (p.portrait) node.portrait = p.portrait;
    if (p.deceased) node.deceased = p.deceased;  // ← add this
    map[p.id] = node;
  });
  let root = null;
  list.forEach(p => {
    if (p.parentId === null) { root = map[p.id]; }
    else if (map[p.parentId]) { map[p.parentId].children.push(map[p.id]); }
  });
  function clean(n) {
    if (n.children.length === 0) delete n.children;
    else n.children.forEach(clean);
  }
  if (root) clean(root);
  return root;
}

const data = buildTree(people);
export { people };
export default data;