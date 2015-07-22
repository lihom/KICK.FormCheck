/*
 * KICK.FormCheck
 * 
 * @author		hom
 * @copyright	Copyright (C) KICKcreative Co., All Rights Reserved.
 * @important	need library jquery.placeholder.min.js
 * 
 */

var KICK = KICK || {};

(function(KICK) {

	/**
	 * FormCheck
	 * @param _elm_form: html form element id
	 * 
	 **/

	KICK.FormCheck = function(_elm_form, _configs) {
		
		// Public value
		this.ERR = '';
		this.ERRS = [];
		this.ERR_DISPLAY = 'append';
		this.ERR_DISPLAY_APPEND_CLASS = 'form_check_invalid_msg';
		this.DATA = [];
		this.DISABLE_NAME = 'invalid';
		this.LANG = 'en';
		this.$form = {};
		this.form_event = 'submit';
		this.$form_event_ta = {};
		this.form_event_ta = null;
		this.submit_hook = null;
		this.valid_err_hook = null;
		
		// Private value
		var _debug = false;
		var form_err_lang = {
			'tw': {
				'empty': '欄位必填',
				'format': '格式錯誤',
				'choose': '選項必選',
				'length': '字元長度錯誤',
				'confirm_pw': '確認密碼與密碼不符'
			},
			'en': {
				'empty': 'field is required',
				'format': 'format error',
				'choose': 'options required',
				'length': 'word length error',
				'confirm_pw': 'confirm password and password do not match'
			}
		};
		
		// Hook function
		this.submit_hook = {};
		this.invalid_hook = {};
		
		// Set function in object
		this.__construct = function() {
			_this.$form = $(_elm_form);
			_this.$form_event_ta = (!_this.form_event_ta) ? _this.$form : $(_this.form_event_ta);
			
			_this.create_data();
			_this.bind_self();

			_this.$form_event_ta.bind(_this.form_event, function(e) {
				e.preventDefault();
				_this.valid();
			});
		};
		
		
		/*
		 * init_textfield
		 * @note	init input, textarea value and event
		 * 
		 */
		 
		this.init_textfield = function() {
			var $textfield = $('input[placeholder], textarea[placeholder]', _this.$form);
			
			if ($textfield.length == 0) return;
			
			if ($.browser.msie && $.browser.version == '10.0') {
				try {
					$textfield.placeholder();
				} catch(err) {
					console.log(err);
				}
			}
		};
		
		
		/*
		 * create_data
		 * @note	
		 * 
		 */
		 
		this.create_data = function() {
			_this.DATA = [];
			_this.$form.find('input, select, textarea').filter(function() {
				var result = true,
					$this = $(this),
					type = $this.attr('type');
					
				if ($this[0].tagName.toLowerCase() == 'input') {
					switch (type) {
						case 'text':
						case 'password':
						case 'radio':
						case 'checkbox':
							result = true;
							break;
						default:
							result = false;
							break;
					}
				}
				
				if ($this.attr(_this.DISABLE_NAME) != undefined) result = false;
				
				return result;
			}).each(function(i) {
				var $this = $(this),
					arr = [];
				
				arr['reg'] = $this.attr('reg') ? $this.attr('reg') : '';
				arr['bind'] = $this.attr('bind') ? $this.attr('bind') : '';
				arr['label'] = $this.attr('label') ? $this.attr('label') : '';
				arr['name'] = $this.attr('name');
				arr['value'] = $this.val();
				arr['type'] = $this.attr('type');
				arr['tag'] = $this[0].tagName.toLowerCase();
				arr['object'] = $this;
				
				_this.DATA.push(arr);
			});
		};


		/*
		 * create_data
		 * @note	
		 * 
		 */
		 
		this.bind_self = function() {
			for (var k in _this.DATA) {
				if (_this.DATA[k]['bind'] != '') {
					var obj = _this.DATA[k]['object'],
						evt = _this.DATA[k]['bind'];

					obj.data('index', k);

					obj.bind(evt, function() {
						_this.reg_valid($(this).data('index'));
					});
				}
			}
		};
		
		
		/*
		 * valid
		 * @note	valid form field
		 * 
		 */
		 
		this.valid = function() {
			if (typeof _this.invalid_hook == 'function') _this.invalid_hook();

			_this.ERR = 0;
			_this.ERRS = [];
			_this.create_data();

			if (_debug) console.log('-------------- debug mode --------------');

			for (var k in _this.DATA) {
				if (_debug) console.log('name: '+_this.DATA[k]['name']+', value: '+_this.DATA[k]['value']);
				switch (_this.DATA[k]['tag']) {
					case 'input':
						switch (_this.DATA[k]['type']) {
							case 'text':
							case 'password':
								if (_this.DATA[k]['value'] == '') {
									_this.empty_err(k);
								} else {
									_this.reg_valid(k);
								}
								break;
								
							case 'radio':
							case 'checkbox':
								if ($('input[name=\''+_this.DATA[k]['name']+'\']:checked', _this.$form).length < 1) {
									_this.choose_err(k);
								}
								break;
						}
						break;
						
					case 'select':
						if (_this.DATA[k]['value'] == '0' || _this.DATA[k]['value'] == '') {
							_this.choose_err(k);
						}
						break;
						
					case 'textarea':
						if (_this.DATA[k]['value'] == '' || _this.DATA[k]['value'] == _this.DATA[k]['object'].attr('label')) {
							_this.empty_err(k);
						}
						break;
				}
			}
			
			_this.valid_final();
		};
		
		
		/*
		 * valid_final
		 * @note	create area code number
		 * 
		 */
		 
		this.valid_final = function() {
			_this.$form.find('.' + _this.ERR_DISPLAY_APPEND_CLASS).remove();

			if (_this.ERR > 0) {
				switch (_this.ERR_DISPLAY) {
					case 'alert':
						var err_alert_str = '';
						for (var k in _this.ERRS) {
							if (err_alert_str.lastIndexOf(_this.ERRS[k]) <= -1) {
								err_alert_str += '* '+_this.ERRS[k]+'\n';
							}
						}
						alert(err_alert_str);
						break;
					
					case 'append':
						for (var k in _this.ERRS) {
							_this.DATA[k]['object'].parent().append('<span class="' + _this.ERR_DISPLAY_APPEND_CLASS + '">' + _this.ERRS[k] + '</span>');
						}
						break;

					case 'dialog':
						var err_alert_str = '';
						for (var k in _this.ERRS) {
							if (err_alert_str.lastIndexOf(_this.ERRS[k]) <= -1) {
								err_alert_str += '* '+_this.ERRS[k]+'</br>';
							}
						}
						try {
							_msg.alert(err_alert_str);
						} catch (err) {
							alert(err_alert_str);
						}
						break;
				}

				if (_this.valid_err_hook) {
					_this.valid_err_hook();
				}
			} else {
				if (_this.submit_hook) {
					_this.submit_hook();
				} else {
					if (_debug) {
						console.log('submit');
					} else {
						_this.$form[0].submit();
					}
				}
			}
		};
		
		
		/*
		 * empty_err
		 * @note	valid form field
		 * 
		 */
		 
		this.empty_err = function(k) {
			_this.ERR++;
			_this.ERRS[k] = [];
			_this.ERRS[k] = _this.DATA[k]['label'] + ' ' + form_err_lang[_this.LANG]['empty'];
		};
		
		
		/*
		 * format_err
		 * @note	valid form field
		 * 
		 */
		 
		this.format_err = function(k) {
			_this.ERR++;
			_this.ERRS[k] = [];
			_this.ERRS[k] = _this.DATA[k]['label'] + ' ' + form_err_lang[_this.LANG]['format'];
		};
		
		
		/*
		 * choose_err
		 * @note	valid form field
		 * 
		 */
		 
		this.choose_err = function(k) {
			_this.ERR++;
			_this.ERRS[k] = [];
			_this.ERRS[k] = _this.DATA[k]['label'] + ' ' + form_err_lang[_this.LANG]['choose'];
		};
		
		
		/*
		 * length_err
		 * @note	valid form field
		 * 
		 */
		 
		this.length_err = function(k) {
			_this.ERR++;
			_this.ERRS[k] = [];
			_this.ERRS[k] = _this.DATA[k]['label'] + ' ' + form_err_lang[_this.LANG]['length'];
		};
		
		
		/*
		 * confirm_pw_err
		 * @note	valid form field
		 * 
		 */
		 
		this.confirm_pw_err = function(k) {
			_this.ERR++;
			_this.ERRS[k] = [];
			_this.ERRS[k] = _this.DATA[k]['label'] + ' ' + form_err_lang[_this.LANG]['confirm_pw'];
		};
		
		
		/*
		 * reg_valid
		 * @note	valid form field
		 * 
		 */
		 
		this.reg_valid = function(k) {
			var obj = _this.DATA[k]['object'],
				reg = _this.DATA[k]['reg'],
				val = obj.val();
			
			var result = new Boolean(),
				patt = new RegExp();
				
			switch (reg) {
				case 'invoice':
					patt = new RegExp("^[a-zA-Z]{2}[0-9]{8}$");
					break;
					
				case 'phone':
					// length error
					if (val.length < 1 || val.length > 99) {
						_this.length_err(k);
						return;
					}
					
					//patt = new RegExp("^[0-9]{9,99}$");
					//patt = new RegExp("^(999|998|997|996|995|994|993|992|991|990|979|978|977|976|975|974|973|972|971|970|969|968|967|966|965|964|963|962|961|960|899|898|897|896|895|894|893|892|891|890|889|888|887|886|885|884|883|882|881|880|879|878|877|876|875|874|873|872|871|870|859|858|857|856|855|854|853|852|851|850|839|838|837|836|835|834|833|832|831|830|809|808|807|806|805|804|803|802|801|800|699|698|697|696|695|694|693|692|691|690|689|688|687|686|685|684|683|682|681|680|679|678|677|676|675|674|673|672|671|670|599|598|597|596|595|594|593|592|591|590|509|508|507|506|505|504|503|502|501|500|429|428|427|426|425|424|423|422|421|420|389|388|387|386|385|384|383|382|381|380|379|378|377|376|375|374|373|372|371|370|359|358|357|356|355|354|353|352|351|350|299|298|297|296|295|294|293|292|291|290|289|288|287|286|285|284|283|282|281|280|269|268|267|266|265|264|263|262|261|260|259|258|257|256|255|254|253|252|251|250|249|248|247|246|245|244|243|242|241|240|239|238|237|236|235|234|233|232|231|230|229|228|227|226|225|224|223|222|221|220|219|218|217|216|215|214|213|212|211|210|98|95|94|93|92|91|90|86|84|82|81|66|65|64|63|62|61|60|58|57|56|55|54|53|52|51|49|48|47|46|45|44|43|41|40|39|36|34|33|32|31|30|27|20|7|1)[0-9]{9,99}$");
					patt = new RegExp("^[0-9-|\+|#|(|)]+(\.[0-9-|\+|#|(|)]+)*$");
					break;
					
				case 'social_code':
					//patt = new RegExp("^[a-zA-Z]{1}[0-9]{9}$");
					patt = new RegExp("^[a-zA-Z]{1}[a-zA-Z|0-9]{1}[0-9]{8}$"); // 身分證 & 居留證
					break;
					
				case 'zip_code':
					// length error
					if (val.length < 0 || val.length > 99) {
						_this.length_err(k);
						return;
					}
					
					patt = new RegExp("^[0-9-]+(\.[0-9-]+)*$");
					break;
					
				case 'email':
					patt = new RegExp("^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$");
					break;
					
				case 'name':
					patt = new RegExp("^[_a-zA-Z0-9-\u4E00-\uFA29\uE7C7-\uE7F3\.]+(\.[_a-zA-Z0-9-\u4E00-\uFA29\uE7C7-\uE7F3\.]+)*$");
					break;
					
				case 'pw':
				case 'old_pw':
					// length error
					if (val.length < 6 || val.length > 20) {
						_this.length_err(k);
						return;
					}
					
					//patt = new RegExp("(?=[^A-Z|^a-z]*[A-Z|a-z])(?=[^!@#\$%]*[!@#\$%])");
					patt = new RegExp("(?=[^A-Z|^a-z|^0-9]*[A-Z|a-z|0-9])");
					break;
					
				case 'confirm_pw':
					// length error
					if (val.length < 6 || val.length > 20) {
						_this.length_err(k);
						return;
					}
					
					//patt = new RegExp("(?=[^A-Z|^a-z]*[A-Z|a-z])(?=[^!@#\$%]*[!@#\$%])");
					patt = new RegExp("(?=[^A-Z|^a-z|^0-9]*[A-Z|a-z|0-9])");
					break;
					
				case 'custom':
					patt = new RegExp(obj.attr('regSyntax'));
					break;
			}
			
			result = patt.test(val);
			if (result) {
				if (reg == 'social_code') {
					patt = new RegExp("^[a-zA-Z]{1}[0-9]{9}$");
					if (patt.test(val)) {
						if (!_this.reg_social_code(val, '身分證')) _this.format_err(k);
					}
				}
				if (reg == 'confirm_pw') {
					if ($('input[reg="pw"]', _this.$form).val() != $('input[reg="confirm_pw"]', _this.$form).val()) {
						_this.confirm_pw_err(k);
					}
				}
				if (reg == 'credit_card') {
					if (!_this.reg_credit_card(val, obj)) _this.format_err(k);
				}
				if (reg == 'credit_card_expire') {
					if (!_this.reg_credit_card_expire(val)) _this.format_err(k);
				}
				if (reg == 'credit_card_cvc') {
					if (!_this.reg_credit_card_cvc(val)) _this.format_err(k);
				}
			} else {
				_this.format_err(k);
			}
		};
		
		
		/*
		 * reg_social_code
		 * @note	valid form field
		 * 
		 */
		
		this.reg_social_code = function(val, type) {
			var id = val.toUpperCase();
			
			switch (type) {
				//檢查身分證字號
				case '身分證':
					if (id.length != 10) return false;
				
					if (isNaN(id.substr(1,9)) || (id.substr(0,1)<"A" ||id.substr(0,1)>"Z")) return false;               
				
					var head="ABCDEFGHJKLMNPQRSTUVXYWZIO";
					id = (head.indexOf(id.substring(0,1))+10) +''+ id.substr(1,9);
					s = parseInt(id.substr(0,1)) +
					parseInt(id.substr(1,1)) * 9 +
					parseInt(id.substr(2,1)) * 8 +
					parseInt(id.substr(3,1)) * 7 +          
					parseInt(id.substr(4,1)) * 6 +
					parseInt(id.substr(5,1)) * 5 +
					parseInt(id.substr(6,1)) * 4 +
					parseInt(id.substr(7,1)) * 3 +
					parseInt(id.substr(8,1)) * 2 +
					parseInt(id.substr(9,1)) +
					parseInt(id.substr(10,1));
					
					//判斷是否可整除
					if ((s % 10) != 0) return false;
					
					//身分證字號正確   
					return true;
					
					break;
				
				//檢查居留證號碼
				case '居留證':
					if (id.length != 10) return false;
					
					if (isNaN(id.substr(2,8)) || (id.substr(0,1)<"A" ||id.substr(0,1)>"Z") || (id.substr(1,1)<"A" ||id.substr(1,1)>"Z")) return false;
					
					var head="ABCDEFGHJKLMNPQRSTUVXYWZIO";
					id = (head.indexOf(id.substr(0,1))+10) +''+ ((head.indexOf(id.substr(1,1))+10)%10) +''+ id.substr(2,8);
					s = parseInt(id.substr(0,1)) +
					parseInt(id.substr(1,1)) * 9 +
					parseInt(id.substr(2,1)) * 8 +
					parseInt(id.substr(3,1)) * 7 +
					parseInt(id.substr(4,1)) * 6 +
					parseInt(id.substr(5,1)) * 5 +
					parseInt(id.substr(6,1)) * 4 +
					parseInt(id.substr(7,1)) * 3 +
					parseInt(id.substr(8,1)) * 2 +
					parseInt(id.substr(9,1)) +
					parseInt(id.substr(10,1));
					
					//判斷是否可整除
					if ((s % 10) != 0) return false;
					//居留證號碼正確
					return true;
					
					break;
					
				//檢查護照號碼
				case '護照號':
					if (id.length > 20) return false;
					//護照號碼正確   
					return true;
					
					break;
			}
			
			return false;
		};


		/*
		 * reg_credit_card
		 * @note	valid form field
		 * 
		 */
		
		this.reg_credit_card = function(val, obj) {
			val = val.replace(/\D+/g, '');

			var card_class = 'icon_cards';
			var card_types = [
				{
					name: 'amex',
					pattern: /^3[47]/,
					valid_length: [15]
				}, {
					name: 'diners_club_carte_blanche',
					pattern: /^30[0-5]/,
					valid_length: [14]
				}, {
					name: 'diners_club_international',
					pattern: /^36/,
					valid_length: [14]
				}, {
					name: 'jcb',
					pattern: /^35(2[89]|[3-8][0-9])/,
					valid_length: [16]
				}, {
					name: 'laser',
					pattern: /^(6304|670[69]|6771)/,
					valid_length: [16, 17, 18, 19]
				}, {
					name: 'visa_electron',
					pattern: /^(4026|417500|4508|4844|491(3|7))/,
					valid_length: [16]
				}, {
					name: 'visa',
					pattern: /^4/,
					valid_length: [16]
				}, {
					name: 'mastercard',
					pattern: /^5[1-5]/,
					valid_length: [16]
				}, {
					name: 'maestro',
					pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
					valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
				}, {
					name: 'discover',
					pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
					valid_length: [16]
				}
			];

			for (var k in card_types) {
				var patt = new RegExp(card_types[k].pattern),
					result = patt.test(val);

				if (result) {
					for (var _k in card_types[k].valid_length) {
						if (val.length == card_types[k].valid_length[_k]) {
							var card_type = '';
							switch (card_types[k].name) {
								case 'diners_club_carte_blanche':
								case 'diners_club_international':
								case 'jcb':
								case 'laser':
								case 'visa_electron':
								case 'maestro':
									card_type = 'other';
									break;

								default:
									card_type = card_types[k].name;
									break;
							}

							obj.parent().append('<span class="' + card_class + ' ' + card_type + '"></span>');
							
							return true;
						}
					}
				}
			}

			obj.parent().find('.' + card_class).remove();

			return false;
		};


		/*
		 * reg_credit_card_expire
		 * @note	valid form field
		 * 
		 */
		
		this.reg_credit_card_expire = function(val) {
			val = val.replace(/\D+/g, '');

			var patt = new RegExp(/\d/g),
				result = patt.test(val);

			if (result && val.length == 4) {
				var val_1 = val.slice(0, 2),
					val_2 = val.slice(2, 4),
					year = String(new Date().getFullYear()).slice(2, 4);

				if (val_1 <= 12 && val_1 >= 1 && val_2 >= year) return true;
			}

			return false;
		};


		/*
		 * reg_credit_card_cvc
		 * @note	valid form field
		 * 
		 */
		
		this.reg_credit_card_cvc = function(val) {
			val = val.replace(/\D+/g, '');

			var patt = new RegExp(/\d/g),
				result = patt.test(val);

			if (result && val.length == 3) {
				return true;
			}

			return false;
		};
		
		
		var _this = $.extend(this, _configs);
		
		this.__construct();
	};
	
})(KICK);