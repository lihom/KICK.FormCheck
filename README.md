KICK.FormCheck
======

jQuery plugin: form validation tool
extend plugin: jquery.min.js, jquery.placeholder.min.js

###CSS

```
.form_check_invalid_msg {
	/* 錯誤的樣式 */
	border: 1px red solid;
}
```

###HTML

```
<!--
屬性說明
reg : 驗證的種類，無此屬性，則是以留空為驗證
regSyntax : 可使用正規演算式，ex. http://regexr.com/3akq4
label : 跳alert視窗或append訊息的欄位名稱
invalid : 取消驗證
-->
<form id="form">
	<input type="text" placeholder="姓名" label="姓名" reg="name" value="" />
	<input type="text" placeholder="身分證" label="身分證" reg="social_code" value="" />
	<input type="text" placeholder="電話" label="電話" reg="phone" value="" />
	<input type="text" placeholder="國際電話" label="國際電話" reg="custom" regSyntax="^[+][0-9]{3}[0-9]{8}$" value="" />
	<input type="text" placeholder="發票號碼" label="發票號碼" reg="invoice" value="" />
	<input type="password" placeholder="密碼" label="密碼" reg="pw" value="" />
	<input type="password" placeholder="確認密碼" label="確認密碼" reg="confirm_pw" value="" />
	<textarea placeholder="其他訊息" invalid="invalid"></textarea>
</form>
```

###jQuery

```
var config = {
	ERR_DISPLAY_APPEND_CLASS: 'form_check_invalid_msg', // 這是預設值，可以改成你要的名稱
	ERR_DISPLAY: 'alert' // alert or append 兩種呈現方式
};
var form = KICK.FormCheck('#form', config);
```

###Demo 

http://lab.a2.kiiiick.com/JS/kick.formCheck/demo.html