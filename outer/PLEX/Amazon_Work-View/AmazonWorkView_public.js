(function() {	
	const SCRIPT_ID = 'amazonWorkView';
	const SETTINGS_SCHEMA = {
		name: 'Amazon Work View',
		settings: {
			forcePageToLeft: { label: 'Сдвинуть страницу влево', type: 'boolean', default: false },

			addMirrorLinks: { label: 'Добавить ссылки-зеркала', type: 'boolean', default: true },
			checkDiscount: { label: 'Проверять скидку Amazon', type: 'boolean', default: true },
			showFee: { label: 'Показывать Fee в RevSeller', type: 'boolean', default: true },

			clearAmazon: { label: 'Удалить лишние элементы Амазона', type: 'boolean', default: true },
			clearGrabley: { label: 'Удалить лишние элементы Grabley', type: 'boolean', default: true },
			clearRevseller: { label: 'Удалить лишние элементы RevSeller', type: 'boolean', default: true },
        }
    };

	const REGISTRY_KEY = 'my_scripts_registry';
	const SETTINGS_KEY = 'my_scripts_settings';

    const centralConfig = {
        registerSelf: function() {
            const registry = GM_getValue(REGISTRY_KEY, {});
            registry[SCRIPT_ID] = SETTINGS_SCHEMA;
            GM_setValue(REGISTRY_KEY, registry);
        },
        load: function() {
            const allSettings = GM_getValue(SETTINGS_KEY, {});
            const mySavedSettings = allSettings[SCRIPT_ID] || {};
            const myDefaults = {};
            for(const key in SETTINGS_SCHEMA.settings) {
                myDefaults[key] = SETTINGS_SCHEMA.settings[key].default;
            }
            return { ...myDefaults, ...mySavedSettings };
        }
    };

    async function main() {

		console.log("========== AMZNWV PUBLIC");

        centralConfig.registerSelf();
        const config = centralConfig.load();
        console.log(`(AmazonWorkView) Запущен с конфигом:`, config);

		addCustomCSS(config);

        if (config.addMirrorLinks){
			set_mirror_links();
		}

		if (config.checkDiscount){
			check_discount();
		}

		if (config.showFee){
			await waitForElement("#aic-ext-popup-fba-result-available");
			setInterval(function() {
				set_fee_in_revseller_calc();
			}, 100);
		}
    }
    
    main();

	function waitForElement(selector, timeout = 10000) {
		return new Promise((resolve, reject) => {
			if (!selector) {
				return resolve(null);
			}

			const element = document.querySelector(selector);
			if (element) {
				return resolve(element);
			}

			let observer;
			let timeoutId;

			observer = new MutationObserver(() => {
				const foundElement = document.querySelector(selector);
				if (foundElement) {
					clearTimeout(timeoutId);
					observer.disconnect();
					resolve(foundElement);
				}
			});

			timeoutId = setTimeout(() => {
				observer.disconnect();
				console.warn(`Элемент "${selector}" не появился за ${timeout} мс.`);
				resolve(null);
			}, timeout);

			observer.observe(document.body, { childList: true, subtree: true });
		});
	}

	function set_price(disc_label, price_box_class, price_to_pay){
		console.log("PRICE: " + price_to_pay);

		var disc = disc_label.getElementsByClassName('a-offscreen')[0].innerText
			disc = parseFloat(disc.substring(1))

		console.log("DISCOUNT: " + disc);

		var full_price = price_to_pay + disc;
			full_price = full_price.toFixed(2)

		console.log("FUll price: " + full_price);

		var price_box = document.getElementById(price_box_class);
			price_box.className += " price_box_w_disc";

		var price_holder = document.getElementById(price_box_class);

		var full_price_span = document.createElement('div')
			full_price_span.className = "a-section a-spacing-none aok-align-center aok-relative custom-full-price"
			full_price_span.innerHTML = `Full price: $${full_price}`;

		if (!document.getElementsByClassName("custom-full-price")[0]){
			price_holder.appendChild(full_price_span)
		}
	}

	function check_discount(){
		var price_to_pay_high = ""
		var price_to_pay = ""

		let amz_disc_label = document.getElementById('promoMessagingDiscountValue_feature_div');
		let amz_disc_label2 = document.getElementById('promoMessaging');

		if (amz_disc_label){
			if (amz_disc_label.innerText.includes(" Amazon discount.")) {
				console.log('Скидка найдена! Type 1');
				price_to_pay_high = document.getElementsByClassName("priceToPay")[0]
					price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))

				set_price(amz_disc_label, "corePriceDisplay_desktop_feature_div", price_to_pay)
			}

		} else if (amz_disc_label2) {
			if (amz_disc_label2.innerText.includes(" Amazon discount.")) {
				console.log('Скидка найдена! Type 2');
				price_to_pay_high = document.getElementsByClassName("apexPriceToPay")[0]
					price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))

				set_price(amz_disc_label2, "corePrice_desktop", price_to_pay)
			}
		} else {console.log("Скидка не найдена.");}
	}

	function get_fee_from_revseller_calc(){
		var calc_peak_checkbox = document.getElementById("aic-ext-input-peak")
		var calc_peak_container = document.getElementById("aic-ext-peak-container");
		var calc_peak_span = calc_peak_container.getElementsByTagName("span")[0];
		var calc_peak_text = calc_peak_span.innerText;

		let popup_window = document.getElementById("aic-ext-popup-fba-result-available");
		let popup_rows = popup_window.getElementsByClassName('aic-ext-bg-white')[0]

		let row_referral = popup_rows.getElementsByClassName('aic-ext-flex-row')[1]
		let row_fulfilment = popup_rows.getElementsByClassName('aic-ext-flex-row')[2]

		let referral_fee = row_referral.getElementsByTagName('span')[2]
			referral_fee = parseFloat(referral_fee.innerHTML)

		let fulfilment_fee_fba = 0;

		if (calc_peak_text == "Non-Peak rate" && calc_peak_checkbox.checked == false ||
				calc_peak_text != "Non-Peak rate" && calc_peak_checkbox.checked == true) {
			// is Peak rate default case! Winter time!
				fulfilment_fee_fba = row_fulfilment.getElementsByTagName('span')[2]
		} else {
			// is Non-Peak rate default case!
				fulfilment_fee_fba = row_fulfilment.getElementsByTagName('span')[1]
		}
				fulfilment_fee_fba = parseFloat(fulfilment_fee_fba.innerHTML)

		let fee_fba = referral_fee + fulfilment_fee_fba
		return [fee_fba, referral_fee]
	}

	function set_fee_in_revseller_calc(){
		let calc_root = document.getElementsByClassName("aic-ext-@container")[0];
		let calc_body = calc_root.getElementsByClassName("aic-ext-group/calculator")[0];
		let calc_place = calc_body.getElementsByClassName("aic-ext-h-full")[0];
		// console.log(calc_place)

		if (!calc_place.getElementsByClassName('custom-fee-row')[0]){
			let calc_fee_row = document.createElement('div')
					calc_fee_row.className = 'custom-fee-row aic-ext-flex aic-ext-items-center aic-ext-justify-center aic-ext-mb-3'

			let fee_row_title = document.createElement('div')
					fee_row_title.className = 'aic-ext-w-3/12 aic-ext-text-m aic-ext-text-black group-[.aic-ext-collapsed]/calculator:aic-ext-w-5/12'
					fee_row_title.innerText = 'Fee'

			let fee_row_fbm_cell = document.createElement('div')
					fee_row_fbm_cell.className = 'fee-row-fbm-cell aic-ext-w-4/12 aic-ext-text-m aic-ext-text-black aic-ext-text-right aic-ext-pr-[18px] group-[.aic-ext-collapsed]/calculator:aic-ext-hidden'
					fee_row_fbm_cell.innerText = ' '

			let fee_row_space_cell = document.createElement('div')
					fee_row_space_cell.className = 'aic-ext-w-1/12 group-[.aic-ext-collapsed]/calculator:aic-ext-hidden'

			let fee_row_fba_cell = document.createElement('div')
					fee_row_fba_cell.className = 'fee-row-fba-cell aic-ext-w-4/12 aic-ext-text-right aic-ext-text-m aic-ext-text-black aic-ext-pr-[18px] @xl:group-[.aic-ext-collapsed]/calculator:aic-ext-flex-1 @xl:group-[.aic-ext-collapsed]/calculator:aic-ext-flex-grow'
					fee_row_fba_cell.innerText = ' '

			calc_fee_row.appendChild(fee_row_title)
			calc_fee_row.appendChild(fee_row_fbm_cell)
			calc_fee_row.appendChild(fee_row_space_cell)
			calc_fee_row.appendChild(fee_row_fba_cell)

			calc_place.appendChild(calc_fee_row)
		} else {

			let fee_row_fba_cell = calc_place.getElementsByClassName('fee-row-fba-cell')[0];
			let fee_row_fbm_cell = calc_place.getElementsByClassName('fee-row-fbm-cell')[0];

			let fee = get_fee_from_revseller_calc();
			let fba_fee = fee[0].toFixed(2);
			let fbm_fee = fee[1].toFixed(2);

			if (fee_row_fba_cell.innerText != fba_fee)
			{
				fee_row_fba_cell.innerText = fba_fee;
				fee_row_fbm_cell.innerText = fbm_fee;
			}
		}
	}

	function getASIN() {
		let currentURL = window.location.href;
		let regex = /\bB0\w*\b/g;
		let match = currentURL.match(regex);

		return match ? match[0] : null;
	}

	function set_mirror_links(){

		const asin = getASIN();

		if (asin == null){
			console.error("ASIN не найден!");
			return;
		}

		var title_section = document.getElementById("titleSection");

			if (!title_section){
				title_section = document.getElementById("titleblock_feature_div");
			}

		var title_link_section = document.createElement("div");
			title_link_section.className = "title_link_section";

		var link_us = document.createElement("a");
			link_us.className = "amazon_mirror_link";
			link_us.innerText="AmzUS";

		var link_ca = document.createElement("a");
			link_ca.className = "amazon_mirror_link";
			link_ca.innerText="AmzCA";

		var link_mx = document.createElement("a");
			link_mx.className = "amazon_mirror_link";
			link_mx.innerText="AmzMX";

		if (!title_section.getElementsByClassName("title_link_section")[0]){
			title_section.appendChild(title_link_section);
		}

		link_us.innerText="AmzUS";
		link_us.href = `https://www.amazon.com/gp/product/${asin}`;

		link_ca.innerText="AmzCA";
		link_ca.href = `https://www.amazon.ca/gp/product/${asin}`;

		link_mx.innerText="AmzMX";
		link_mx.href = `https://www.amazon.com.mx/gp/product/${asin}`;


		title_link_section.appendChild(link_us);
		title_link_section.appendChild(link_ca);
		title_link_section.appendChild(link_mx);
	}

	function addCustomCSS(config){
		const customAmazonStyle = document.createElement('style');
			customAmazonStyle.id = "custom-amzWV-css";
			customAmazonStyle.innerHTML = "/* Custom AmznWV CSS */"

		if (config.clearAmazon){
			customAmazonStyle.innerHTML += `
				/*Clear Amazon*/
				#nav-progressive-subnav,
				#nav-main,
				#nav-flyout-rufus,
				#primeDPUpsellContainer,
				#returnsInfoFeature_feature_div,
				#secureTransactionReorderT1_feature_div,
				#mbb_feature_div,
				#detailPageGifting_feature_div,
				#offerDisplayGroupTabSet,
				#primeDPUpsellStaticContainerNPA,
				#desktop-dp-ilm_feature_div_01
				{
					display: none !important;
				}

				.offer-display-features-expander{
					height: 120px!important;
				}
			`;
		}

		if (config.clearRevseller){
			customAmazonStyle.innerHTML += `
				#title .aic-ext-show-hint,
				.aic-ext-title
				{
					display: none !important;
				}
			`;
		}

		if (config.clearGrabley){
			customAmazonStyle.innerHTML += `
				.pvv-ext-wrap-buttons,
				.pvv-ext-wrap-sellers,
				.pvv-ext-wrap-TotalQuantity,
				.pvv-ext-wrap-ProductDetailsLink,
				.pvv-ext-wrap-footer,
				.aic-ext-title
				{
					display: none !important;
				}
			`;
		}

		if (config.checkDiscount){
			customAmazonStyle.innerHTML += `
				/* //*price no discound */
				#corePrice_desktop,
				#corePriceDisplay_desktop_feature_div {
					background-color: rgba(0, 255, 0, 0.3);
				}
				#promoMessagingDiscountValue_feature_div,
				#promoMessaging {
					background-color: rgba(2, 141, 194, 0.3);
				}

				/* //*price w/ discound */
				.price_box_w_disc {
					background-color: rgba(255, 216, 20, 0.3) !important;
				}

				/* // custom full price */
				.custom-full-price {
					font-size: 23px !important;
					padding: 5px 0 4px 0;
					background-color: rgba(0, 255, 0, 0.3);
				}
			`;
		}

		if (config.addMirrorLinks){
			customAmazonStyle.innerHTML += `
				/* // amazon mirror links */
				.title_link_section {
					padding-left: 2px;
				}

				.title_link_section .amazon_mirror_link {
					margin-right: 10px;

					border-radius: 15%;
				}
			`
		}

		if (config.forcePageToLeft){
			customAmazonStyle.innerHTML += `
			#dp {
				margin-left: 0 !important;
			}
			`;
		}

		document.head.appendChild(customAmazonStyle);

	}
})();