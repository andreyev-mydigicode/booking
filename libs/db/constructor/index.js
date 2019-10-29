var async = require('async')
const fs = require('fs-extra')
var path = require('path')
var moment = require('moment')

var mongoose = require('../../mongoose')
var log = require('../../log')(module)

var list = require('../get').list

const getRandomInt = require('../../generators').getRandomInt
const getFalseTrue = require('../../generators').getFalseTrue
const makeWord = require('../../generators').makeWord
const getRepeatDays = require('../../generators').getRepeatDays

var db
//mongoose.set('debug', true)

function requireModels(cb) {
	log.info('requireModels')
	require('../../models/bandwidth')
	require('../../models/company')
	require('../../models/contact')
	require('../../models/country')
	require('../../models/end_point')
	require('../../models/gmt')
	require('../../models/lang')
	require('../../models/meeting')
	require('../../models/role')
	require('../../models/user')

	async.each(
		Object.keys(mongoose.models),
		(modelName, cb) => {
			log.debug('requireModels: ' + modelName)
			mongoose.models[modelName].ensureIndexes(cb)
		},
		err => {
			if (err) log.error('requireModels')
			cb(err)
		}
	)
}

async function createUsers() {
	log.info('createUsers')
	var User = require('../../models/user').User
	let countryArr = [
		{ name: 'AALAND ISLANDS', A2: 'AX', A3: 'ALA', _id: 248 },
		{ name: 'AFGHANISTAN', A2: 'AF', A3: 'AFG', _id: 4 },
		{ name: 'BANIA', A2: 'AL', A3: 'ALB', _id: 8 },
		{ name: 'ALGERIA', A2: 'DZ', A3: 'DZA', _id: 12 },
		{ name: 'AMERICAN SAMOA', A2: 'AS', A3: 'ASM', _id: 16 },
		{ name: 'ANDORRA', A2: 'AD', A3: 'AND', _id: 20 },
		{ name: 'ANGOLA', A2: 'AO', A3: 'AGO', _id: 24 },
		{ name: 'ANGUILLA', A2: 'AI', A3: 'AIA', _id: 660 },
		{ name: 'ANTARCTICA', A2: 'AQ', A3: 'ATA', _id: 10 },
		{ name: 'ANTIGUA AND BARBUDA', A2: 'AG', A3: 'ATG', _id: 28 },
		{ name: 'ARGENTINA', A2: 'AR', A3: 'ARG', _id: 32 },
		{ name: 'ARMENIA', A2: 'AM', A3: 'ARM', _id: 51 },
		{ name: 'ARUBA', A2: 'AW', A3: 'ABW', _id: 533 },
		{ name: 'AUSTRALIA', A2: 'AU', A3: 'AUS', _id: 36 },
		{ name: 'AUSTRIA', A2: 'AT', A3: 'AUT', _id: 40 },
		{ name: 'AZERBAIJAN', A2: 'AZ', A3: 'AZE', _id: 31 },
		{ name: 'BAHAMAS', A2: 'BS', A3: 'BHS', _id: 44 },
		{ name: 'BAHRAIN', A2: 'BH', A3: 'BHR', _id: 48 },
		{ name: 'BANGLADESH', A2: 'BD', A3: 'BGD', _id: 50 },
		{ name: 'BARBADOS', A2: 'BB', A3: 'BRB', _id: 52 },
		{ name: 'BELARUS', A2: 'BY', A3: 'BLR', _id: 112 },
		{ name: 'BELGIUM', A2: 'BE', A3: 'BEL', _id: 56 },
		{ name: 'BELIZE', A2: 'BZ', A3: 'BLZ', _id: 84 },
		{ name: 'BENIN', A2: 'BJ', A3: 'BEN', _id: 204 },
		{ name: 'BERMUDA', A2: 'BM', A3: 'BMU', _id: 60 },
		{ name: 'BHUTAN', A2: 'BT', A3: 'BTN', _id: 64 },
		{ name: 'BOLIVIA', A2: 'BO', A3: 'BOL', _id: 68 },
		{ name: 'BOSNIA AND HERZEGOWINA', A2: 'BA', A3: 'BIH', _id: 70 },
		{ name: 'BOTSWANA', A2: 'BW', A3: 'BWA', _id: 72 },
		{ name: 'BOUVET ISLAND', A2: 'BV', A3: 'BVT', _id: 74 },
		{ name: 'BRAZIL', A2: 'BR', A3: 'BRA', _id: 76 },
		{ name: 'BRITISH INDIAN OCEAN TERRITORY', A2: 'IO', A3: 'IOT', _id: 86 },
		{ name: 'BRUNEI DARUSSALAM', A2: 'BN', A3: 'BRN', _id: 96 },
		{ name: 'BULGARIA', A2: 'BG', A3: 'BGR', _id: 100 },
		{ name: 'BURKINA FASO', A2: 'BF', A3: 'BFA', _id: 854 },
		{ name: 'BURUNDI', A2: 'BI', A3: 'BDI', _id: 108 },
		{ name: 'CAMBODIA', A2: 'KH', A3: 'KHM', _id: 116 },
		{ name: 'CAMEROON', A2: 'CM', A3: 'CMR', _id: 120 },
		{ name: 'CANADA', A2: 'CA', A3: 'CAN', _id: 124 },
		{ name: 'CAPE VERDE', A2: 'CV', A3: 'CPV', _id: 132 },
		{ name: 'CAYMAN ISLANDS', A2: 'KY', A3: 'CYM', _id: 136 },
		{ name: 'CENTRAL AFRICAN REPUBLIC', A2: 'CF', A3: 'CAF', _id: 140 },
		{ name: 'CHAD', A2: 'TD', A3: 'TCD', _id: 148 },
		{ name: 'CHILE', A2: 'CL', A3: 'CHL', _id: 152 },
		{ name: 'CHINA', A2: 'CN', A3: 'CHN', _id: 156 },
		{ name: 'CHRISTMAS ISLAND', A2: 'CX', A3: 'CXR', _id: 162 },
		{ name: 'COCOS (KEELING) ISLANDS', A2: 'CC', A3: 'CCK', _id: 166 },
		{ name: 'COLOMBIA', A2: 'CO', A3: 'COL', _id: 170 },
		{ name: 'COMOROS', A2: 'KM', A3: 'COM', _id: 174 },
		{ name: 'CONGO, Democratic Republic of (was Zaire)', A2: 'CD', A3: 'COD', _id: 180 },
		{ name: 'CONGO, Republic of', A2: 'CG', A3: 'COG', _id: 178 },
		{ name: 'COOK ISLANDS', A2: 'CK', A3: 'COK', _id: 184 },
		{ name: 'COSTA RICA', A2: 'CR', A3: 'CRI', _id: 188 },
		{ name: "COTE D'IVOIRE", A2: 'CI', A3: 'CIV', _id: 384 },
		{ name: 'CROATIA (local name: Hrvatska)', A2: 'HR', A3: 'HRV', _id: 191 },
		{ name: 'CUBA', A2: 'CU', A3: 'CUB', _id: 192 },
		{ name: 'CYPRUS', A2: 'CY', A3: 'CYP', _id: 196 },
		{ name: 'CZECH REPUBLIC', A2: 'CZ', A3: 'CZE', _id: 203 },
		{ name: 'DENMARK', A2: 'DK', A3: 'DNK', _id: 208 },
		{ name: 'DJIBOUTI', A2: 'DJ', A3: 'DJI', _id: 262 },
		{ name: 'DOMINICA', A2: 'DM', A3: 'DMA', _id: 212 },
		{ name: 'DOMINICAN REPUBLIC', A2: 'DO', A3: 'DOM', _id: 214 },
		{ name: 'ECUADOR', A2: 'EC', A3: 'ECU', _id: 218 },
		{ name: 'EGYPT', A2: 'EG', A3: 'EGY', _id: 818 },
		{ name: 'EL SALVADOR', A2: 'SV', A3: 'SLV', _id: 222 },
		{ name: 'EQUATORIAL GUINEA', A2: 'GQ', A3: 'GNQ', _id: 226 },
		{ name: 'ERITREA', A2: 'ER', A3: 'ERI', _id: 232 },
		{ name: 'ESTONIA', A2: 'EE', A3: 'EST', _id: 233 },
		{ name: 'ETHIOPIA', A2: 'ET', A3: 'ETH', _id: 231 },
		{ name: 'FALKLAND ISLANDS (MALVINAS)', A2: 'FK', A3: 'FLK', _id: 238 },
		{ name: 'FAROE ISLANDS', A2: 'FO', A3: 'FRO', _id: 234 },
		{ name: 'FIJI', A2: 'FJ', A3: 'FJI', _id: 242 },
		{ name: 'FINLAND', A2: 'FI', A3: 'FIN', _id: 246 },
		{ name: 'FRANCE', A2: 'FR', A3: 'FRA', _id: 250 },
		{ name: 'FRENCH GUIANA', A2: 'GF', A3: 'GUF', _id: 254 },
		{ name: 'FRENCH POLYNESIA', A2: 'PF', A3: 'PYF', _id: 258 },
		{ name: 'FRENCH SOUTHERN TERRITORIES', A2: 'TF', A3: 'ATF', _id: 260 },
		{ name: 'GABON', A2: 'GA', A3: 'GAB', _id: 266 },
		{ name: 'GAMBIA', A2: 'GM', A3: 'GMB', _id: 270 },
		{ name: 'GEORGIA', A2: 'GE', A3: 'GEO', _id: 268 },
		{ name: 'GERMANY', A2: 'DE', A3: 'DEU', _id: 276 },
		{ name: 'GHANA', A2: 'GH', A3: 'GHA', _id: 288 },
		{ name: 'GIBRALTAR', A2: 'GI', A3: 'GIB', _id: 292 },
		{ name: 'GREECE', A2: 'GR', A3: 'GRC', _id: 300 },
		{ name: 'GREENLAND', A2: 'GL', A3: 'GRL', _id: 304 },
		{ name: 'GRENADA', A2: 'GD', A3: 'GRD', _id: 308 },
		{ name: 'GUADELOUPE', A2: 'GP', A3: 'GLP', _id: 312 },
		{ name: 'GUAM', A2: 'GU', A3: 'GUM', _id: 316 },
		{ name: 'GUATEMALA', A2: 'GT', A3: 'GTM', _id: 320 },
		{ name: 'GUINEA', A2: 'GN', A3: 'GIN', _id: 324 },
		{ name: 'GUINEA-BISSAU', A2: 'GW', A3: 'GNB', _id: 624 },
		{ name: 'GUYANA', A2: 'GY', A3: 'GUY', _id: 328 },
		{ name: 'HAITI', A2: 'HT', A3: 'HTI', _id: 332 },
		{ name: 'HEARD AND MC DONALD ISLANDS', A2: 'HM', A3: 'HMD', _id: 334 },
		{ name: 'HONDURAS', A2: 'HN', A3: 'HND', _id: 340 },
		{ name: 'HONG KONG', A2: 'HK', A3: 'HKG', _id: 344 },
		{ name: 'HUNGARY', A2: 'HU', A3: 'HUN', _id: 348 },
		{ name: 'ICELAND', A2: 'IS', A3: 'ISL', _id: 352 },
		{ name: 'INDIA', A2: 'IN', A3: 'IND', _id: 356 },
		{ name: 'INDONESIA', A2: 'ID', A3: 'IDN', _id: 360 },
		{ name: 'IRAN (ISLAMIC REPUBLIC OF)', A2: 'IR', A3: 'IRN', _id: 364 },
		{ name: 'IRAQ', A2: 'IQ', A3: 'IRQ', _id: 368 },
		{ name: 'IRELAND', A2: 'IE', A3: 'IRL', _id: 372 },
		{ name: 'ISRAEL', A2: 'IL', A3: 'ISR', _id: 376 },
		{ name: 'ITALY', A2: 'IT', A3: 'ITA', _id: 380 },
		{ name: 'JAMAICA', A2: 'JM', A3: 'JAM', _id: 388 },
		{ name: 'JAPAN', A2: 'JP', A3: 'JPN', _id: 392 },
		{ name: 'JORDAN', A2: 'JO', A3: 'JOR', _id: 400 },
		{ name: 'KAZAKHSTAN', A2: 'KZ', A3: 'KAZ', _id: 398 },
		{ name: 'KENYA', A2: 'KE', A3: 'KEN', _id: 404 },
		{ name: 'KIRIBATI', A2: 'KI', A3: 'KIR', _id: 296 },
		{ name: "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF", A2: 'KP', A3: 'PRK', _id: 408 },
		{ name: 'KOREA, REPUBLIC OF', A2: 'KR', A3: 'KOR', _id: 410 },
		{ name: 'KUWAIT', A2: 'KW', A3: 'KWT', _id: 414 },
		{ name: 'KYRGYZSTAN', A2: 'KG', A3: 'KGZ', _id: 417 },
		{ name: "LAO PEOPLE'S DEMOCRATIC REPUBLIC", A2: 'LA', A3: 'LAO', _id: 418 },
		{ name: 'LATVIA', A2: 'LV', A3: 'LVA', _id: 428 },
		{ name: 'LEBANON', A2: 'LB', A3: 'LBN', _id: 422 },
		{ name: 'LESOTHO', A2: 'LS', A3: 'LSO', _id: 426 },
		{ name: 'LIBERIA', A2: 'LR', A3: 'LBR', _id: 430 },
		{ name: 'LIBYAN ARAB JAMAHIRIYA', A2: 'LY', A3: 'LBY', _id: 434 },
		{ name: 'LIECHTENSTEIN', A2: 'LI', A3: 'LIE', _id: 438 },
		{ name: 'LITHUANIA', A2: 'LT', A3: 'LTU', _id: 440 },
		{ name: 'LUXEMBOURG', A2: 'LU', A3: 'LUX', _id: 442 },
		{ name: 'MACAU', A2: 'MO', A3: 'MAC', _id: 446 },
		{ name: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', A2: 'MK', A3: 'MKD', _id: 807 },
		{ name: 'MADAGASCAR', A2: 'MG', A3: 'MDG', _id: 450 },
		{ name: 'MALAWI', A2: 'MW', A3: 'MWI', _id: 454 },
		{ name: 'MALAYSIA', A2: 'MY', A3: 'MYS', _id: 458 },
		{ name: 'MALDIVES', A2: 'MV', A3: 'MDV', _id: 462 },
		{ name: 'MALI', A2: 'ML', A3: 'MLI', _id: 466 },
		{ name: 'MALTA', A2: 'MT', A3: 'MLT', _id: 470 },
		{ name: 'MARSHALL ISLANDS', A2: 'MH', A3: 'MHL', _id: 584 },
		{ name: 'MARTINIQUE', A2: 'MQ', A3: 'MTQ', _id: 474 },
		{ name: 'MAURITANIA', A2: 'MR', A3: 'MRT', _id: 478 },
		{ name: 'MAURITIUS', A2: 'MU', A3: 'MUS', _id: 480 },
		{ name: 'MAYOTTE', A2: 'YT', A3: 'MYT', _id: 175 },
		{ name: 'MEXICO', A2: 'MX', A3: 'MEX', _id: 484 },
		{ name: 'MICRONESIA, FEDERATED STATES OF', A2: 'FM', A3: 'FSM', _id: 583 },
		{ name: 'MOLDOVA, REPUBLIC OF', A2: 'MD', A3: 'MDA', _id: 498 },
		{ name: 'MONACO', A2: 'MC', A3: 'MCO', _id: 492 },
		{ name: 'MONGOLIA', A2: 'MN', A3: 'MNG', _id: 496 },
		{ name: 'MONTSERRAT', A2: 'MS', A3: 'MSR', _id: 500 },
		{ name: 'MOROCCO', A2: 'MA', A3: 'MAR', _id: 504 },
		{ name: 'MOZAMBIQUE', A2: 'MZ', A3: 'MOZ', _id: 508 },
		{ name: 'MYANMAR', A2: 'MM', A3: 'MMR', _id: 104 },
		{ name: 'NAMIBIA', A2: 'NA', A3: 'NAM', _id: 516 },
		{ name: 'NAURU', A2: 'NR', A3: 'NRU', _id: 520 },
		{ name: 'NEPAL', A2: 'NP', A3: 'NPL', _id: 524 },
		{ name: 'NETHERLANDS', A2: 'NL', A3: 'NLD', _id: 528 },
		{ name: 'NETHERLANDS ANTILLES', A2: 'AN', A3: 'ANT', _id: 530 },
		{ name: 'NEW CALEDONIA', A2: 'NC', A3: 'NCL', _id: 540 },
		{ name: 'NEW ZEALAND', A2: 'NZ', A3: 'NZL', _id: 554 },
		{ name: 'NICARAGUA', A2: 'NI', A3: 'NIC', _id: 558 },
		{ name: 'NIGER', A2: 'NE', A3: 'NER', _id: 562 },
		{ name: 'NIGERIA', A2: 'NG', A3: 'NGA', _id: 566 },
		{ name: 'NIUE', A2: 'NU', A3: 'NIU', _id: 570 },
		{ name: 'NORFOLK ISLAND', A2: 'NF', A3: 'NFK', _id: 574 },
		{ name: 'NORTHERN MARIANA ISLANDS', A2: 'MP', A3: 'MNP', _id: 580 },
		{ name: 'NORWAY', A2: 'NO', A3: 'NOR', _id: 578 },
		{ name: 'OMAN', A2: 'OM', A3: 'OMN', _id: 512 },
		{ name: 'PAKISTAN', A2: 'PK', A3: 'PAK', _id: 586 },
		{ name: 'PALAU', A2: 'PW', A3: 'PLW', _id: 585 },
		{ name: 'PALESTINIAN TERRITORY, Occupied', A2: 'PS', A3: 'PSE', _id: 275 },
		{ name: 'PANAMA', A2: 'PA', A3: 'PAN', _id: 591 },
		{ name: 'PAPUA NEW GUINEA', A2: 'PG', A3: 'PNG', _id: 598 },
		{ name: 'PARAGUAY', A2: 'PY', A3: 'PRY', _id: 600 },
		{ name: 'PERU', A2: 'PE', A3: 'PER', _id: 604 },
		{ name: 'PHILIPPINES', A2: 'PH', A3: 'PHL', _id: 608 },
		{ name: 'PITCAIRN', A2: 'PN', A3: 'PCN', _id: 612 },
		{ name: 'POLAND', A2: 'PL', A3: 'POL', _id: 616 },
		{ name: 'PORTUGAL', A2: 'PT', A3: 'PRT', _id: 620 },
		{ name: 'PUERTO RICO', A2: 'PR', A3: 'PRI', _id: 630 },
		{ name: 'QATAR', A2: 'QA', A3: 'QAT', _id: 634 },
		{ name: 'REUNION', A2: 'RE', A3: 'REU', _id: 638 },
		{ name: 'ROMANIA', A2: 'RO', A3: 'ROU', _id: 642 },
		{ name: 'RUSSIAN FEDERATION', A2: 'RU', A3: 'RUS', _id: 643 },
		{ name: 'RWANDA', A2: 'RW', A3: 'RWA', _id: 646 },
		{ name: 'SAINT HELENA', A2: 'SH', A3: 'SHN', _id: 654 },
		{ name: 'SAINT KITTS AND NEVIS', A2: 'KN', A3: 'KNA', _id: 659 },
		{ name: 'SAINT LUCIA', A2: 'LC', A3: 'LCA', _id: 662 },
		{ name: 'SAINT PIERRE AND MIQUELON', A2: 'PM', A3: 'SPM', _id: 666 },
		{ name: 'SAINT VINCENT AND THE GRENADINES', A2: 'VC', A3: 'VCT', _id: 670 },
		{ name: 'SAMOA', A2: 'WS', A3: 'WSM', _id: 882 },
		{ name: 'SAN MARINO', A2: 'SM', A3: 'SMR', _id: 674 },
		{ name: 'SAO TOME AND PRINCIPE', A2: 'ST', A3: 'STP', _id: 678 },
		{ name: 'SAUDI ARABIA', A2: 'SA', A3: 'SAU', _id: 682 },
		{ name: 'SENEGAL', A2: 'SN', A3: 'SEN', _id: 686 },
		{ name: 'SERBIA AND MONTENEGRO', A2: 'CS', A3: 'SCG', _id: 891 },
		{ name: 'SEYCHELLES', A2: 'SC', A3: 'SYC', _id: 690 },
		{ name: 'SIERRA LEONE', A2: 'SL', A3: 'SLE', _id: 694 },
		{ name: 'SINGAPORE', A2: 'SG', A3: 'SGP', _id: 702 },
		{ name: 'SLOVAKIA', A2: 'SK', A3: 'SVK', _id: 703 },
		{ name: 'SLOVENIA', A2: 'SI', A3: 'SVN', _id: 705 },
		{ name: 'SOLOMON ISLANDS', A2: 'SB', A3: 'SLB', _id: 90 },
		{ name: 'SOMALIA', A2: 'SO', A3: 'SOM', _id: 706 },
		{ name: 'SOUTH AFRICA', A2: 'ZA', A3: 'ZAF', _id: 710 },
		{ name: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', A2: 'GS', A3: 'SGS', _id: 239 },
		{ name: 'SPAIN', A2: 'ES', A3: 'ESP', _id: 724 },
		{ name: 'SRI LANKA', A2: 'LK', A3: 'LKA', _id: 144 },
		{ name: 'SUDAN', A2: 'SD', A3: 'SDN', _id: 736 },
		{ name: 'SURINAME', A2: 'SR', A3: 'SUR', _id: 740 },
		{ name: 'SVALBARD AND JAN MAYEN ISLANDS', A2: 'SJ', A3: 'SJM', _id: 744 },
		{ name: 'SWAZILAND', A2: 'SZ', A3: 'SWZ', _id: 748 },
		{ name: 'SWEDEN', A2: 'SE', A3: 'SWE', _id: 752 },
		{ name: 'SWITZERLAND', A2: 'CH', A3: 'CHE', _id: 756 },
		{ name: 'SYRIAN ARAB REPUBLIC', A2: 'SY', A3: 'SYR', _id: 760 },
		{ name: 'TAIWAN', A2: 'TW', A3: 'TWN', _id: 158 },
		{ name: 'TAJIKISTAN', A2: 'TJ', A3: 'TJK', _id: 762 },
		{ name: 'TANZANIA, UNITED REPUBLIC OF', A2: 'TZ', A3: 'TZA', _id: 834 },
		{ name: 'THAILAND', A2: 'TH', A3: 'THA', _id: 764 },
		{ name: 'TIMOR-LESTE', A2: 'TL', A3: 'TLS', _id: 626 },
		{ name: 'TOGO', A2: 'TG', A3: 'TGO', _id: 768 },
		{ name: 'TOKELAU', A2: 'TK', A3: 'TKL', _id: 772 },
		{ name: 'TONGA', A2: 'TO', A3: 'TON', _id: 776 },
		{ name: 'TRINIDAD AND TOBAGO', A2: 'TT', A3: 'TTO', _id: 780 },
		{ name: 'TUNISIA', A2: 'TN', A3: 'TUN', _id: 788 },
		{ name: 'TURKEY', A2: 'TR', A3: 'TUR', _id: 792 },
		{ name: 'TURKMENISTAN', A2: 'TM', A3: 'TKM', _id: 795 },
		{ name: 'TURKS AND CAICOS ISLANDS', A2: 'TC', A3: 'TCA', _id: 796 },
		{ name: 'TUVALU', A2: 'TV', A3: 'TUV', _id: 798 },
		{ name: 'UGANDA', A2: 'UG', A3: 'UGA', _id: 800 },
		{ name: 'UKRAINE', A2: 'UA', A3: 'UKR', _id: 804 },
		{ name: 'UNITED ARAB EMIRATES', A2: 'AE', A3: 'ARE', _id: 784 },
		{ name: 'UNITED KINGDOM', A2: 'GB', A3: 'GBR', _id: 826 },
		{ name: 'UNITED STATES', A2: 'US', A3: 'USA', _id: 840 },
		{ name: 'UNITED STATES MINOR OUTLYING ISLANDS', A2: 'UM', A3: 'UMI', _id: 581 },
		{ name: 'URUGUAY', A2: 'UY', A3: 'URY', _id: 858 },
		{ name: 'UZBEKISTAN', A2: 'UZ', A3: 'UZB', _id: 860 },
		{ name: 'VANUATU', A2: 'VU', A3: 'VUT', _id: 548 },
		{ name: 'VATICAN CITY STATE (HOLY SEE)', A2: 'VA', A3: 'VAT', _id: 336 },
		{ name: 'VENEZUELA', A2: 'VE', A3: 'VEN', _id: 862 },
		{ name: 'VIET NAM', A2: 'VN', A3: 'VNM', _id: 704 },
		{ name: 'VIRGIN ISLANDS (BRITISH)', A2: 'VG', A3: 'VGB', _id: 92 },
		{ name: 'VIRGIN ISLANDS (U.S.)', A2: 'VI', A3: 'VIR', _id: 850 },
		{ name: 'WALLIS AND FUTUNA ISLANDS', A2: 'WF', A3: 'WLF', _id: 876 },
		{ name: 'WESTERN SAHARA', A2: 'EH', A3: 'ESH', _id: 732 },
		{ name: 'YEMEN', A2: 'YE', A3: 'YEM', _id: 887 },
		{ name: 'ZAMBIA', A2: 'ZM', A3: 'ZMB', _id: 894 },
		{ name: 'ZIMBABWE', A2: 'ZW', A3: 'ZWE', _id: 716 }
	]
	var Company = require('../../models/company').Company
	let companyArr = await Company.find({})
	let users = [
		{
			fname: 'Emil',
			lname: 'Daimon',
			email: 'emelianov.dmitrij@gmail.com',
			password: '1',
			confirmation: true,
			active: true,
			role: 2,
			country: 804,
			company: companyArr[getRandomInt(0, companyArr.length)]._id,
			phone: '423453425342',
			zip: 65436453,
			gmt: 15,
			lang: 2,
			type: 'person'
		},
		{
			fname: 'test_fnalme',
			lname: 'test_lnalme',
			email: 'v1@test.com',
			password: 'asdsadsa',
			confirmation: true,
			active: true,
			role: 2,
			country: 804,
			company: companyArr[getRandomInt(0, companyArr.length)]._id,
			phone: '6789678764874684678',
			zip: 34534534,
			gmt: 15,
			lang: 2,
			type: 'person'
		}
	]
	for (let i = 0; i < 1000; i++)
		users.push({
			fname: makeWord(5, 10),
			lname: makeWord(5, 10),
			email: makeWord(5, 10) + '@' + makeWord(3, 5) + makeWord(2, 2),
			password: makeWord(5, 10),
			confirmation: true,
			active: true,
			role: getRandomInt(0, 4),
			country: countryArr[getRandomInt(0, countryArr.length)]._id,
			company: companyArr[getRandomInt(0, companyArr.length)]._id,
			phone: getRandomInt(1000000, 10000000),
			zip: getRandomInt(10000, 100000),
			gmt: getRandomInt(0, 26),
			lang: getRandomInt(0, 4),
			type: 'person'
		})

	async.each(
		users,
		(userData, cb) => {
			let user = new User(userData)
			user.save(cb)
		},
		err => {
			if (err) log.error('createUsers: ' + err)
		}
	)
}

function createRole(cb) {
	log.info('createRole')
	var Role = require('../../models/role').Role
	let items = [
		{ _id: 0, name: 'Administrator' },
		{ _id: 1, name: 'Moderator' },
		{ _id: 2, name: 'User' },
		{ _id: 3, name: 'Contact' }
	]
	async.each(
		items,
		(itemData, cb) => {

			let item = new Role(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createRole')
			cb(err)
		}
	)
}

function createGMT(cb) {
	log.info('createGMT')
	var GMT = require('../../models/gmt').GMT
	let items = []
	for (let i = -12, j = 0; i <= 12; i++ , j++)
		items.push({ _id: j, time: i })
	async.each(
		items,
		(itemData, cb) => {

			let item = new GMT(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createGMT')
			cb(err)
		}
	)
}

function createLang(cb) {
	log.info('createLang')
	var Lang = require('../../models/lang').Lang
	let items = [
		{ _id: 0, name: 'EN' },
		{ _id: 1, name: 'FR' },
		{ _id: 2, name: 'RU' }
	]
	async.each(
		items,
		(itemData, cb) => {
			let item = new Lang(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createLang')
			cb(err)
		}
	)
}

function createCompany(cb) {
	log.info('createCompany')
	var Company = require('../../models/company').Company
	let items = []
	for (let i = 0; i < 100; i++)
		items.push({ name: makeWord(), siret: makeWord() })
	async.each(
		items,
		(itemData, cb) => {
			let item = new Company(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createCompany')
			cb(err)
		}
	)
}

function createBandwidth(cb) {
	log.info('createBandwidth')
	var Bandwidth = require('../../models/bandwidth').Bandwidth
	let items = [
		{ _id: 0, speed: 512 },
		{ _id: 1, speed: 720 },
		{ _id: 2, speed: 1024 },
		{ _id: 3, speed: 2048 }
	]
	async.each(
		items,
		(itemData, cb) => {

			let item = new Bandwidth(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createBandwidth')
			cb(err)
		}
	)
}

async function createCountry(cb) {
	log.info('createCountry')
	var Country = require('../../models/country').Country
	let countryArr = [
		{ name: 'AALAND ISLANDS', A2: 'AX', A3: 'ALA', _id: 248 },
		{ name: 'AFGHANISTAN', A2: 'AF', A3: 'AFG', _id: 4 },
		{ name: 'BANIA', A2: 'AL', A3: 'ALB', _id: 8 },
		{ name: 'ALGERIA', A2: 'DZ', A3: 'DZA', _id: 12 },
		{ name: 'AMERICAN SAMOA', A2: 'AS', A3: 'ASM', _id: 16 },
		{ name: 'ANDORRA', A2: 'AD', A3: 'AND', _id: 20 },
		{ name: 'ANGOLA', A2: 'AO', A3: 'AGO', _id: 24 },
		{ name: 'ANGUILLA', A2: 'AI', A3: 'AIA', _id: 660 },
		{ name: 'ANTARCTICA', A2: 'AQ', A3: 'ATA', _id: 10 },
		{ name: 'ANTIGUA AND BARBUDA', A2: 'AG', A3: 'ATG', _id: 28 },
		{ name: 'ARGENTINA', A2: 'AR', A3: 'ARG', _id: 32 },
		{ name: 'ARMENIA', A2: 'AM', A3: 'ARM', _id: 51 },
		{ name: 'ARUBA', A2: 'AW', A3: 'ABW', _id: 533 },
		{ name: 'AUSTRALIA', A2: 'AU', A3: 'AUS', _id: 36 },
		{ name: 'AUSTRIA', A2: 'AT', A3: 'AUT', _id: 40 },
		{ name: 'AZERBAIJAN', A2: 'AZ', A3: 'AZE', _id: 31 },
		{ name: 'BAHAMAS', A2: 'BS', A3: 'BHS', _id: 44 },
		{ name: 'BAHRAIN', A2: 'BH', A3: 'BHR', _id: 48 },
		{ name: 'BANGLADESH', A2: 'BD', A3: 'BGD', _id: 50 },
		{ name: 'BARBADOS', A2: 'BB', A3: 'BRB', _id: 52 },
		{ name: 'BELARUS', A2: 'BY', A3: 'BLR', _id: 112 },
		{ name: 'BELGIUM', A2: 'BE', A3: 'BEL', _id: 56 },
		{ name: 'BELIZE', A2: 'BZ', A3: 'BLZ', _id: 84 },
		{ name: 'BENIN', A2: 'BJ', A3: 'BEN', _id: 204 },
		{ name: 'BERMUDA', A2: 'BM', A3: 'BMU', _id: 60 },
		{ name: 'BHUTAN', A2: 'BT', A3: 'BTN', _id: 64 },
		{ name: 'BOLIVIA', A2: 'BO', A3: 'BOL', _id: 68 },
		{ name: 'BOSNIA AND HERZEGOWINA', A2: 'BA', A3: 'BIH', _id: 70 },
		{ name: 'BOTSWANA', A2: 'BW', A3: 'BWA', _id: 72 },
		{ name: 'BOUVET ISLAND', A2: 'BV', A3: 'BVT', _id: 74 },
		{ name: 'BRAZIL', A2: 'BR', A3: 'BRA', _id: 76 },
		{ name: 'BRITISH INDIAN OCEAN TERRITORY', A2: 'IO', A3: 'IOT', _id: 86 },
		{ name: 'BRUNEI DARUSSALAM', A2: 'BN', A3: 'BRN', _id: 96 },
		{ name: 'BULGARIA', A2: 'BG', A3: 'BGR', _id: 100 },
		{ name: 'BURKINA FASO', A2: 'BF', A3: 'BFA', _id: 854 },
		{ name: 'BURUNDI', A2: 'BI', A3: 'BDI', _id: 108 },
		{ name: 'CAMBODIA', A2: 'KH', A3: 'KHM', _id: 116 },
		{ name: 'CAMEROON', A2: 'CM', A3: 'CMR', _id: 120 },
		{ name: 'CANADA', A2: 'CA', A3: 'CAN', _id: 124 },
		{ name: 'CAPE VERDE', A2: 'CV', A3: 'CPV', _id: 132 },
		{ name: 'CAYMAN ISLANDS', A2: 'KY', A3: 'CYM', _id: 136 },
		{ name: 'CENTRAL AFRICAN REPUBLIC', A2: 'CF', A3: 'CAF', _id: 140 },
		{ name: 'CHAD', A2: 'TD', A3: 'TCD', _id: 148 },
		{ name: 'CHILE', A2: 'CL', A3: 'CHL', _id: 152 },
		{ name: 'CHINA', A2: 'CN', A3: 'CHN', _id: 156 },
		{ name: 'CHRISTMAS ISLAND', A2: 'CX', A3: 'CXR', _id: 162 },
		{ name: 'COCOS (KEELING) ISLANDS', A2: 'CC', A3: 'CCK', _id: 166 },
		{ name: 'COLOMBIA', A2: 'CO', A3: 'COL', _id: 170 },
		{ name: 'COMOROS', A2: 'KM', A3: 'COM', _id: 174 },
		{ name: 'CONGO, Democratic Republic of (was Zaire)', A2: 'CD', A3: 'COD', _id: 180 },
		{ name: 'CONGO, Republic of', A2: 'CG', A3: 'COG', _id: 178 },
		{ name: 'COOK ISLANDS', A2: 'CK', A3: 'COK', _id: 184 },
		{ name: 'COSTA RICA', A2: 'CR', A3: 'CRI', _id: 188 },
		{ name: "COTE D'IVOIRE", A2: 'CI', A3: 'CIV', _id: 384 },
		{ name: 'CROATIA (local name: Hrvatska)', A2: 'HR', A3: 'HRV', _id: 191 },
		{ name: 'CUBA', A2: 'CU', A3: 'CUB', _id: 192 },
		{ name: 'CYPRUS', A2: 'CY', A3: 'CYP', _id: 196 },
		{ name: 'CZECH REPUBLIC', A2: 'CZ', A3: 'CZE', _id: 203 },
		{ name: 'DENMARK', A2: 'DK', A3: 'DNK', _id: 208 },
		{ name: 'DJIBOUTI', A2: 'DJ', A3: 'DJI', _id: 262 },
		{ name: 'DOMINICA', A2: 'DM', A3: 'DMA', _id: 212 },
		{ name: 'DOMINICAN REPUBLIC', A2: 'DO', A3: 'DOM', _id: 214 },
		{ name: 'ECUADOR', A2: 'EC', A3: 'ECU', _id: 218 },
		{ name: 'EGYPT', A2: 'EG', A3: 'EGY', _id: 818 },
		{ name: 'EL SALVADOR', A2: 'SV', A3: 'SLV', _id: 222 },
		{ name: 'EQUATORIAL GUINEA', A2: 'GQ', A3: 'GNQ', _id: 226 },
		{ name: 'ERITREA', A2: 'ER', A3: 'ERI', _id: 232 },
		{ name: 'ESTONIA', A2: 'EE', A3: 'EST', _id: 233 },
		{ name: 'ETHIOPIA', A2: 'ET', A3: 'ETH', _id: 231 },
		{ name: 'FALKLAND ISLANDS (MALVINAS)', A2: 'FK', A3: 'FLK', _id: 238 },
		{ name: 'FAROE ISLANDS', A2: 'FO', A3: 'FRO', _id: 234 },
		{ name: 'FIJI', A2: 'FJ', A3: 'FJI', _id: 242 },
		{ name: 'FINLAND', A2: 'FI', A3: 'FIN', _id: 246 },
		{ name: 'FRANCE', A2: 'FR', A3: 'FRA', _id: 250 },
		{ name: 'FRENCH GUIANA', A2: 'GF', A3: 'GUF', _id: 254 },
		{ name: 'FRENCH POLYNESIA', A2: 'PF', A3: 'PYF', _id: 258 },
		{ name: 'FRENCH SOUTHERN TERRITORIES', A2: 'TF', A3: 'ATF', _id: 260 },
		{ name: 'GABON', A2: 'GA', A3: 'GAB', _id: 266 },
		{ name: 'GAMBIA', A2: 'GM', A3: 'GMB', _id: 270 },
		{ name: 'GEORGIA', A2: 'GE', A3: 'GEO', _id: 268 },
		{ name: 'GERMANY', A2: 'DE', A3: 'DEU', _id: 276 },
		{ name: 'GHANA', A2: 'GH', A3: 'GHA', _id: 288 },
		{ name: 'GIBRALTAR', A2: 'GI', A3: 'GIB', _id: 292 },
		{ name: 'GREECE', A2: 'GR', A3: 'GRC', _id: 300 },
		{ name: 'GREENLAND', A2: 'GL', A3: 'GRL', _id: 304 },
		{ name: 'GRENADA', A2: 'GD', A3: 'GRD', _id: 308 },
		{ name: 'GUADELOUPE', A2: 'GP', A3: 'GLP', _id: 312 },
		{ name: 'GUAM', A2: 'GU', A3: 'GUM', _id: 316 },
		{ name: 'GUATEMALA', A2: 'GT', A3: 'GTM', _id: 320 },
		{ name: 'GUINEA', A2: 'GN', A3: 'GIN', _id: 324 },
		{ name: 'GUINEA-BISSAU', A2: 'GW', A3: 'GNB', _id: 624 },
		{ name: 'GUYANA', A2: 'GY', A3: 'GUY', _id: 328 },
		{ name: 'HAITI', A2: 'HT', A3: 'HTI', _id: 332 },
		{ name: 'HEARD AND MC DONALD ISLANDS', A2: 'HM', A3: 'HMD', _id: 334 },
		{ name: 'HONDURAS', A2: 'HN', A3: 'HND', _id: 340 },
		{ name: 'HONG KONG', A2: 'HK', A3: 'HKG', _id: 344 },
		{ name: 'HUNGARY', A2: 'HU', A3: 'HUN', _id: 348 },
		{ name: 'ICELAND', A2: 'IS', A3: 'ISL', _id: 352 },
		{ name: 'INDIA', A2: 'IN', A3: 'IND', _id: 356 },
		{ name: 'INDONESIA', A2: 'ID', A3: 'IDN', _id: 360 },
		{ name: 'IRAN (ISLAMIC REPUBLIC OF)', A2: 'IR', A3: 'IRN', _id: 364 },
		{ name: 'IRAQ', A2: 'IQ', A3: 'IRQ', _id: 368 },
		{ name: 'IRELAND', A2: 'IE', A3: 'IRL', _id: 372 },
		{ name: 'ISRAEL', A2: 'IL', A3: 'ISR', _id: 376 },
		{ name: 'ITALY', A2: 'IT', A3: 'ITA', _id: 380 },
		{ name: 'JAMAICA', A2: 'JM', A3: 'JAM', _id: 388 },
		{ name: 'JAPAN', A2: 'JP', A3: 'JPN', _id: 392 },
		{ name: 'JORDAN', A2: 'JO', A3: 'JOR', _id: 400 },
		{ name: 'KAZAKHSTAN', A2: 'KZ', A3: 'KAZ', _id: 398 },
		{ name: 'KENYA', A2: 'KE', A3: 'KEN', _id: 404 },
		{ name: 'KIRIBATI', A2: 'KI', A3: 'KIR', _id: 296 },
		{ name: "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF", A2: 'KP', A3: 'PRK', _id: 408 },
		{ name: 'KOREA, REPUBLIC OF', A2: 'KR', A3: 'KOR', _id: 410 },
		{ name: 'KUWAIT', A2: 'KW', A3: 'KWT', _id: 414 },
		{ name: 'KYRGYZSTAN', A2: 'KG', A3: 'KGZ', _id: 417 },
		{ name: "LAO PEOPLE'S DEMOCRATIC REPUBLIC", A2: 'LA', A3: 'LAO', _id: 418 },
		{ name: 'LATVIA', A2: 'LV', A3: 'LVA', _id: 428 },
		{ name: 'LEBANON', A2: 'LB', A3: 'LBN', _id: 422 },
		{ name: 'LESOTHO', A2: 'LS', A3: 'LSO', _id: 426 },
		{ name: 'LIBERIA', A2: 'LR', A3: 'LBR', _id: 430 },
		{ name: 'LIBYAN ARAB JAMAHIRIYA', A2: 'LY', A3: 'LBY', _id: 434 },
		{ name: 'LIECHTENSTEIN', A2: 'LI', A3: 'LIE', _id: 438 },
		{ name: 'LITHUANIA', A2: 'LT', A3: 'LTU', _id: 440 },
		{ name: 'LUXEMBOURG', A2: 'LU', A3: 'LUX', _id: 442 },
		{ name: 'MACAU', A2: 'MO', A3: 'MAC', _id: 446 },
		{ name: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', A2: 'MK', A3: 'MKD', _id: 807 },
		{ name: 'MADAGASCAR', A2: 'MG', A3: 'MDG', _id: 450 },
		{ name: 'MALAWI', A2: 'MW', A3: 'MWI', _id: 454 },
		{ name: 'MALAYSIA', A2: 'MY', A3: 'MYS', _id: 458 },
		{ name: 'MALDIVES', A2: 'MV', A3: 'MDV', _id: 462 },
		{ name: 'MALI', A2: 'ML', A3: 'MLI', _id: 466 },
		{ name: 'MALTA', A2: 'MT', A3: 'MLT', _id: 470 },
		{ name: 'MARSHALL ISLANDS', A2: 'MH', A3: 'MHL', _id: 584 },
		{ name: 'MARTINIQUE', A2: 'MQ', A3: 'MTQ', _id: 474 },
		{ name: 'MAURITANIA', A2: 'MR', A3: 'MRT', _id: 478 },
		{ name: 'MAURITIUS', A2: 'MU', A3: 'MUS', _id: 480 },
		{ name: 'MAYOTTE', A2: 'YT', A3: 'MYT', _id: 175 },
		{ name: 'MEXICO', A2: 'MX', A3: 'MEX', _id: 484 },
		{ name: 'MICRONESIA, FEDERATED STATES OF', A2: 'FM', A3: 'FSM', _id: 583 },
		{ name: 'MOLDOVA, REPUBLIC OF', A2: 'MD', A3: 'MDA', _id: 498 },
		{ name: 'MONACO', A2: 'MC', A3: 'MCO', _id: 492 },
		{ name: 'MONGOLIA', A2: 'MN', A3: 'MNG', _id: 496 },
		{ name: 'MONTSERRAT', A2: 'MS', A3: 'MSR', _id: 500 },
		{ name: 'MOROCCO', A2: 'MA', A3: 'MAR', _id: 504 },
		{ name: 'MOZAMBIQUE', A2: 'MZ', A3: 'MOZ', _id: 508 },
		{ name: 'MYANMAR', A2: 'MM', A3: 'MMR', _id: 104 },
		{ name: 'NAMIBIA', A2: 'NA', A3: 'NAM', _id: 516 },
		{ name: 'NAURU', A2: 'NR', A3: 'NRU', _id: 520 },
		{ name: 'NEPAL', A2: 'NP', A3: 'NPL', _id: 524 },
		{ name: 'NETHERLANDS', A2: 'NL', A3: 'NLD', _id: 528 },
		{ name: 'NETHERLANDS ANTILLES', A2: 'AN', A3: 'ANT', _id: 530 },
		{ name: 'NEW CALEDONIA', A2: 'NC', A3: 'NCL', _id: 540 },
		{ name: 'NEW ZEALAND', A2: 'NZ', A3: 'NZL', _id: 554 },
		{ name: 'NICARAGUA', A2: 'NI', A3: 'NIC', _id: 558 },
		{ name: 'NIGER', A2: 'NE', A3: 'NER', _id: 562 },
		{ name: 'NIGERIA', A2: 'NG', A3: 'NGA', _id: 566 },
		{ name: 'NIUE', A2: 'NU', A3: 'NIU', _id: 570 },
		{ name: 'NORFOLK ISLAND', A2: 'NF', A3: 'NFK', _id: 574 },
		{ name: 'NORTHERN MARIANA ISLANDS', A2: 'MP', A3: 'MNP', _id: 580 },
		{ name: 'NORWAY', A2: 'NO', A3: 'NOR', _id: 578 },
		{ name: 'OMAN', A2: 'OM', A3: 'OMN', _id: 512 },
		{ name: 'PAKISTAN', A2: 'PK', A3: 'PAK', _id: 586 },
		{ name: 'PALAU', A2: 'PW', A3: 'PLW', _id: 585 },
		{ name: 'PALESTINIAN TERRITORY, Occupied', A2: 'PS', A3: 'PSE', _id: 275 },
		{ name: 'PANAMA', A2: 'PA', A3: 'PAN', _id: 591 },
		{ name: 'PAPUA NEW GUINEA', A2: 'PG', A3: 'PNG', _id: 598 },
		{ name: 'PARAGUAY', A2: 'PY', A3: 'PRY', _id: 600 },
		{ name: 'PERU', A2: 'PE', A3: 'PER', _id: 604 },
		{ name: 'PHILIPPINES', A2: 'PH', A3: 'PHL', _id: 608 },
		{ name: 'PITCAIRN', A2: 'PN', A3: 'PCN', _id: 612 },
		{ name: 'POLAND', A2: 'PL', A3: 'POL', _id: 616 },
		{ name: 'PORTUGAL', A2: 'PT', A3: 'PRT', _id: 620 },
		{ name: 'PUERTO RICO', A2: 'PR', A3: 'PRI', _id: 630 },
		{ name: 'QATAR', A2: 'QA', A3: 'QAT', _id: 634 },
		{ name: 'REUNION', A2: 'RE', A3: 'REU', _id: 638 },
		{ name: 'ROMANIA', A2: 'RO', A3: 'ROU', _id: 642 },
		{ name: 'RUSSIAN FEDERATION', A2: 'RU', A3: 'RUS', _id: 643 },
		{ name: 'RWANDA', A2: 'RW', A3: 'RWA', _id: 646 },
		{ name: 'SAINT HELENA', A2: 'SH', A3: 'SHN', _id: 654 },
		{ name: 'SAINT KITTS AND NEVIS', A2: 'KN', A3: 'KNA', _id: 659 },
		{ name: 'SAINT LUCIA', A2: 'LC', A3: 'LCA', _id: 662 },
		{ name: 'SAINT PIERRE AND MIQUELON', A2: 'PM', A3: 'SPM', _id: 666 },
		{ name: 'SAINT VINCENT AND THE GRENADINES', A2: 'VC', A3: 'VCT', _id: 670 },
		{ name: 'SAMOA', A2: 'WS', A3: 'WSM', _id: 882 },
		{ name: 'SAN MARINO', A2: 'SM', A3: 'SMR', _id: 674 },
		{ name: 'SAO TOME AND PRINCIPE', A2: 'ST', A3: 'STP', _id: 678 },
		{ name: 'SAUDI ARABIA', A2: 'SA', A3: 'SAU', _id: 682 },
		{ name: 'SENEGAL', A2: 'SN', A3: 'SEN', _id: 686 },
		{ name: 'SERBIA AND MONTENEGRO', A2: 'CS', A3: 'SCG', _id: 891 },
		{ name: 'SEYCHELLES', A2: 'SC', A3: 'SYC', _id: 690 },
		{ name: 'SIERRA LEONE', A2: 'SL', A3: 'SLE', _id: 694 },
		{ name: 'SINGAPORE', A2: 'SG', A3: 'SGP', _id: 702 },
		{ name: 'SLOVAKIA', A2: 'SK', A3: 'SVK', _id: 703 },
		{ name: 'SLOVENIA', A2: 'SI', A3: 'SVN', _id: 705 },
		{ name: 'SOLOMON ISLANDS', A2: 'SB', A3: 'SLB', _id: 90 },
		{ name: 'SOMALIA', A2: 'SO', A3: 'SOM', _id: 706 },
		{ name: 'SOUTH AFRICA', A2: 'ZA', A3: 'ZAF', _id: 710 },
		{ name: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', A2: 'GS', A3: 'SGS', _id: 239 },
		{ name: 'SPAIN', A2: 'ES', A3: 'ESP', _id: 724 },
		{ name: 'SRI LANKA', A2: 'LK', A3: 'LKA', _id: 144 },
		{ name: 'SUDAN', A2: 'SD', A3: 'SDN', _id: 736 },
		{ name: 'SURINAME', A2: 'SR', A3: 'SUR', _id: 740 },
		{ name: 'SVALBARD AND JAN MAYEN ISLANDS', A2: 'SJ', A3: 'SJM', _id: 744 },
		{ name: 'SWAZILAND', A2: 'SZ', A3: 'SWZ', _id: 748 },
		{ name: 'SWEDEN', A2: 'SE', A3: 'SWE', _id: 752 },
		{ name: 'SWITZERLAND', A2: 'CH', A3: 'CHE', _id: 756 },
		{ name: 'SYRIAN ARAB REPUBLIC', A2: 'SY', A3: 'SYR', _id: 760 },
		{ name: 'TAIWAN', A2: 'TW', A3: 'TWN', _id: 158 },
		{ name: 'TAJIKISTAN', A2: 'TJ', A3: 'TJK', _id: 762 },
		{ name: 'TANZANIA, UNITED REPUBLIC OF', A2: 'TZ', A3: 'TZA', _id: 834 },
		{ name: 'THAILAND', A2: 'TH', A3: 'THA', _id: 764 },
		{ name: 'TIMOR-LESTE', A2: 'TL', A3: 'TLS', _id: 626 },
		{ name: 'TOGO', A2: 'TG', A3: 'TGO', _id: 768 },
		{ name: 'TOKELAU', A2: 'TK', A3: 'TKL', _id: 772 },
		{ name: 'TONGA', A2: 'TO', A3: 'TON', _id: 776 },
		{ name: 'TRINIDAD AND TOBAGO', A2: 'TT', A3: 'TTO', _id: 780 },
		{ name: 'TUNISIA', A2: 'TN', A3: 'TUN', _id: 788 },
		{ name: 'TURKEY', A2: 'TR', A3: 'TUR', _id: 792 },
		{ name: 'TURKMENISTAN', A2: 'TM', A3: 'TKM', _id: 795 },
		{ name: 'TURKS AND CAICOS ISLANDS', A2: 'TC', A3: 'TCA', _id: 796 },
		{ name: 'TUVALU', A2: 'TV', A3: 'TUV', _id: 798 },
		{ name: 'UGANDA', A2: 'UG', A3: 'UGA', _id: 800 },
		{ name: 'UKRAINE', A2: 'UA', A3: 'UKR', _id: 804 },
		{ name: 'UNITED ARAB EMIRATES', A2: 'AE', A3: 'ARE', _id: 784 },
		{ name: 'UNITED KINGDOM', A2: 'GB', A3: 'GBR', _id: 826 },
		{ name: 'UNITED STATES', A2: 'US', A3: 'USA', _id: 840 },
		{ name: 'UNITED STATES MINOR OUTLYING ISLANDS', A2: 'UM', A3: 'UMI', _id: 581 },
		{ name: 'URUGUAY', A2: 'UY', A3: 'URY', _id: 858 },
		{ name: 'UZBEKISTAN', A2: 'UZ', A3: 'UZB', _id: 860 },
		{ name: 'VANUATU', A2: 'VU', A3: 'VUT', _id: 548 },
		{ name: 'VATICAN CITY STATE (HOLY SEE)', A2: 'VA', A3: 'VAT', _id: 336 },
		{ name: 'VENEZUELA', A2: 'VE', A3: 'VEN', _id: 862 },
		{ name: 'VIET NAM', A2: 'VN', A3: 'VNM', _id: 704 },
		{ name: 'VIRGIN ISLANDS (BRITISH)', A2: 'VG', A3: 'VGB', _id: 92 },
		{ name: 'VIRGIN ISLANDS (U.S.)', A2: 'VI', A3: 'VIR', _id: 850 },
		{ name: 'WALLIS AND FUTUNA ISLANDS', A2: 'WF', A3: 'WLF', _id: 876 },
		{ name: 'WESTERN SAHARA', A2: 'EH', A3: 'ESH', _id: 732 },
		{ name: 'YEMEN', A2: 'YE', A3: 'YEM', _id: 887 },
		{ name: 'ZAMBIA', A2: 'ZM', A3: 'ZMB', _id: 894 },
		{ name: 'ZIMBABWE', A2: 'ZW', A3: 'ZWE', _id: 716 }
	]
	async.each(
		countryArr,
		(itemData, cb) => {
			let item = new Country(itemData)
			item.save(cb)
		},
		err => {
			if (err) log.error('createCountry')
			cb(err)
		}
	)
}

async function createMeeting(cb) {
	log.info('createMeeting')
	var Meeting = require('../../models/meeting').Meeting
	var User = require('../../models/user').User
	let users = await User.find({})
	let items = []

	const tmp_to_ms = 60 * 1000
	const tmp_to_24h = 24 * 60

	for (let i = 0; i < 20000; i++) {
		let guests = []
		for (let i = 0; i < getRandomInt(0, 2); i++)
			guests.push(makeWord(5, 10))
		let DD = getRandomInt(1, 29)
		DD = DD < 10 ? '0' + DD : DD
		let MM = getRandomInt(1, 13)
		let MM2 = MM + getRandomInt(0, 2)
		MM = MM < 10 ? '0' + MM : MM
		MM2 = MM2 < 10 ? '0' + MM2 : MM2
		let YYYY = getRandomInt(2017, 2020)
		let repeat_start_day = [DD, MM, YYYY].join('.')
		let repeat_end_day = [DD, MM2, YYYY].join('.')
		let repeat_days = ''
		if (repeat_start_day != repeat_end_day) repeat_days = getRepeatDays()
		let all_date = []
		let hour = getRandomInt(0, 24)
		hour < 10 ? hour = '0' + hour : null
		let hour2 = getRandomInt(0, 24)
		hour2 < 10 ? hour2 = '0' + hour2 : null
		let mm = getRandomInt(0, 60)
		mm < 10 ? mm = '0' + mm : null
		let mm2 = getRandomInt(0, 60)
		mm2 < 10 ? mm2 = '0' + mm2 : null
		let time_start = hour + ':' + mm
		let time_end = hour2 + ':' + mm2

		let duration
		let tmp_time_start = +hour * 60 + +mm
		let tmp_time_end = +hour2 * 60 + +mm2

		if (+tmp_time_end > +tmp_time_start)
			duration = tmp_time_end - tmp_time_start
		else
			duration = tmp_to_24h + tmp_time_start - tmp_time_end

		let dhh = Math.floor(duration / 60)
		dhh < 10 ? dhh = '0' + dhh : null
		let dmm = duration % 60
		dmm < 10 ? dmm = '0' + dmm : null
		let duration_hm = dhh + ':' + dmm

		let meeting_days = []
		let rsd = moment(repeat_start_day, 'DD.MM.YYYY')
		let red = moment(repeat_end_day, 'DD.MM.YYYY')
		meeting_days.push({
			user: users[getRandomInt(0, users.length)],
			host_pin: getRandomInt(1000, 9999),
			guest_pin: getRandomInt(1000, 9999),
			guests,
			hour,
			subject: makeWord(5, 10),
			massage: makeWord(10, 50),
			time_start,
			time_end,
			duration,
			duration_hm,
			user_list: [users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)]],
			guest_list: [users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)]],
			week: rsd.week(),
			year: rsd.year(),
			date: rsd.format('DD.MM.YYYY')
		})
		rsd.add(1, 'day')
		let rd = repeat_days.split(',')
		while (rsd <= red) {
			for (let i = 0; i < rd.length; i++)
				if (+rd[i] == +rsd.isoWeekday())
					meeting_days.push({
						user: users[getRandomInt(0, users.length)],
						host_pin: getRandomInt(1000, 9999),
						guest_pin: getRandomInt(1000, 9999),
						guests,
						hour,
						subject: makeWord(5, 10),
						massage: makeWord(10, 50),
						time_start,
						time_end,
						duration,
						duration_hm,
						user_list: [users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)]],
						guest_list: [users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)], users[getRandomInt(0, users.length)]],
						week: rsd.week(),
						year: rsd.year(),
						date: rsd.format('DD.MM.YYYY')
					})
			rsd.add(1, 'day')
		}
		items.push({
			access: getFalseTrue(),
			repeat_days,
			repeat_start_day,
			repeat_end_day,
			meeting_days
		})
	}
	/*
		async.each(
			items,
			(itemData, i, cb) => {
				let item = new Meeting(itemData)
				item.save(cb)
			},
			err => {
				if (err) log.error('createMeeting')
				cb(err)
			}
		)
	*/

	Meeting.insertMany(
		items,
		err => {
			if (err) {
				log.error('createMeeting: ' + err)
			}
		}
	)

}

async function createEndPoints() {
	log.info('createEndPoints')
	var End_Point = require('../../models/end_point').End_Point
	let countryArr = [
		{ name: 'AALAND ISLANDS', A2: 'AX', A3: 'ALA', _id: 248 },
		{ name: 'AFGHANISTAN', A2: 'AF', A3: 'AFG', _id: 4 },
		{ name: 'BANIA', A2: 'AL', A3: 'ALB', _id: 8 },
		{ name: 'ALGERIA', A2: 'DZ', A3: 'DZA', _id: 12 },
		{ name: 'AMERICAN SAMOA', A2: 'AS', A3: 'ASM', _id: 16 },
		{ name: 'ANDORRA', A2: 'AD', A3: 'AND', _id: 20 },
		{ name: 'ANGOLA', A2: 'AO', A3: 'AGO', _id: 24 },
		{ name: 'ANGUILLA', A2: 'AI', A3: 'AIA', _id: 660 },
		{ name: 'ANTARCTICA', A2: 'AQ', A3: 'ATA', _id: 10 },
		{ name: 'ANTIGUA AND BARBUDA', A2: 'AG', A3: 'ATG', _id: 28 },
		{ name: 'ARGENTINA', A2: 'AR', A3: 'ARG', _id: 32 },
		{ name: 'ARMENIA', A2: 'AM', A3: 'ARM', _id: 51 },
		{ name: 'ARUBA', A2: 'AW', A3: 'ABW', _id: 533 },
		{ name: 'AUSTRALIA', A2: 'AU', A3: 'AUS', _id: 36 },
		{ name: 'AUSTRIA', A2: 'AT', A3: 'AUT', _id: 40 },
		{ name: 'AZERBAIJAN', A2: 'AZ', A3: 'AZE', _id: 31 },
		{ name: 'BAHAMAS', A2: 'BS', A3: 'BHS', _id: 44 },
		{ name: 'BAHRAIN', A2: 'BH', A3: 'BHR', _id: 48 },
		{ name: 'BANGLADESH', A2: 'BD', A3: 'BGD', _id: 50 },
		{ name: 'BARBADOS', A2: 'BB', A3: 'BRB', _id: 52 },
		{ name: 'BELARUS', A2: 'BY', A3: 'BLR', _id: 112 },
		{ name: 'BELGIUM', A2: 'BE', A3: 'BEL', _id: 56 },
		{ name: 'BELIZE', A2: 'BZ', A3: 'BLZ', _id: 84 },
		{ name: 'BENIN', A2: 'BJ', A3: 'BEN', _id: 204 },
		{ name: 'BERMUDA', A2: 'BM', A3: 'BMU', _id: 60 },
		{ name: 'BHUTAN', A2: 'BT', A3: 'BTN', _id: 64 },
		{ name: 'BOLIVIA', A2: 'BO', A3: 'BOL', _id: 68 },
		{ name: 'BOSNIA AND HERZEGOWINA', A2: 'BA', A3: 'BIH', _id: 70 },
		{ name: 'BOTSWANA', A2: 'BW', A3: 'BWA', _id: 72 },
		{ name: 'BOUVET ISLAND', A2: 'BV', A3: 'BVT', _id: 74 },
		{ name: 'BRAZIL', A2: 'BR', A3: 'BRA', _id: 76 },
		{ name: 'BRITISH INDIAN OCEAN TERRITORY', A2: 'IO', A3: 'IOT', _id: 86 },
		{ name: 'BRUNEI DARUSSALAM', A2: 'BN', A3: 'BRN', _id: 96 },
		{ name: 'BULGARIA', A2: 'BG', A3: 'BGR', _id: 100 },
		{ name: 'BURKINA FASO', A2: 'BF', A3: 'BFA', _id: 854 },
		{ name: 'BURUNDI', A2: 'BI', A3: 'BDI', _id: 108 },
		{ name: 'CAMBODIA', A2: 'KH', A3: 'KHM', _id: 116 },
		{ name: 'CAMEROON', A2: 'CM', A3: 'CMR', _id: 120 },
		{ name: 'CANADA', A2: 'CA', A3: 'CAN', _id: 124 },
		{ name: 'CAPE VERDE', A2: 'CV', A3: 'CPV', _id: 132 },
		{ name: 'CAYMAN ISLANDS', A2: 'KY', A3: 'CYM', _id: 136 },
		{ name: 'CENTRAL AFRICAN REPUBLIC', A2: 'CF', A3: 'CAF', _id: 140 },
		{ name: 'CHAD', A2: 'TD', A3: 'TCD', _id: 148 },
		{ name: 'CHILE', A2: 'CL', A3: 'CHL', _id: 152 },
		{ name: 'CHINA', A2: 'CN', A3: 'CHN', _id: 156 },
		{ name: 'CHRISTMAS ISLAND', A2: 'CX', A3: 'CXR', _id: 162 },
		{ name: 'COCOS (KEELING) ISLANDS', A2: 'CC', A3: 'CCK', _id: 166 },
		{ name: 'COLOMBIA', A2: 'CO', A3: 'COL', _id: 170 },
		{ name: 'COMOROS', A2: 'KM', A3: 'COM', _id: 174 },
		{ name: 'CONGO, Democratic Republic of (was Zaire)', A2: 'CD', A3: 'COD', _id: 180 },
		{ name: 'CONGO, Republic of', A2: 'CG', A3: 'COG', _id: 178 },
		{ name: 'COOK ISLANDS', A2: 'CK', A3: 'COK', _id: 184 },
		{ name: 'COSTA RICA', A2: 'CR', A3: 'CRI', _id: 188 },
		{ name: "COTE D'IVOIRE", A2: 'CI', A3: 'CIV', _id: 384 },
		{ name: 'CROATIA (local name: Hrvatska)', A2: 'HR', A3: 'HRV', _id: 191 },
		{ name: 'CUBA', A2: 'CU', A3: 'CUB', _id: 192 },
		{ name: 'CYPRUS', A2: 'CY', A3: 'CYP', _id: 196 },
		{ name: 'CZECH REPUBLIC', A2: 'CZ', A3: 'CZE', _id: 203 },
		{ name: 'DENMARK', A2: 'DK', A3: 'DNK', _id: 208 },
		{ name: 'DJIBOUTI', A2: 'DJ', A3: 'DJI', _id: 262 },
		{ name: 'DOMINICA', A2: 'DM', A3: 'DMA', _id: 212 },
		{ name: 'DOMINICAN REPUBLIC', A2: 'DO', A3: 'DOM', _id: 214 },
		{ name: 'ECUADOR', A2: 'EC', A3: 'ECU', _id: 218 },
		{ name: 'EGYPT', A2: 'EG', A3: 'EGY', _id: 818 },
		{ name: 'EL SALVADOR', A2: 'SV', A3: 'SLV', _id: 222 },
		{ name: 'EQUATORIAL GUINEA', A2: 'GQ', A3: 'GNQ', _id: 226 },
		{ name: 'ERITREA', A2: 'ER', A3: 'ERI', _id: 232 },
		{ name: 'ESTONIA', A2: 'EE', A3: 'EST', _id: 233 },
		{ name: 'ETHIOPIA', A2: 'ET', A3: 'ETH', _id: 231 },
		{ name: 'FALKLAND ISLANDS (MALVINAS)', A2: 'FK', A3: 'FLK', _id: 238 },
		{ name: 'FAROE ISLANDS', A2: 'FO', A3: 'FRO', _id: 234 },
		{ name: 'FIJI', A2: 'FJ', A3: 'FJI', _id: 242 },
		{ name: 'FINLAND', A2: 'FI', A3: 'FIN', _id: 246 },
		{ name: 'FRANCE', A2: 'FR', A3: 'FRA', _id: 250 },
		{ name: 'FRENCH GUIANA', A2: 'GF', A3: 'GUF', _id: 254 },
		{ name: 'FRENCH POLYNESIA', A2: 'PF', A3: 'PYF', _id: 258 },
		{ name: 'FRENCH SOUTHERN TERRITORIES', A2: 'TF', A3: 'ATF', _id: 260 },
		{ name: 'GABON', A2: 'GA', A3: 'GAB', _id: 266 },
		{ name: 'GAMBIA', A2: 'GM', A3: 'GMB', _id: 270 },
		{ name: 'GEORGIA', A2: 'GE', A3: 'GEO', _id: 268 },
		{ name: 'GERMANY', A2: 'DE', A3: 'DEU', _id: 276 },
		{ name: 'GHANA', A2: 'GH', A3: 'GHA', _id: 288 },
		{ name: 'GIBRALTAR', A2: 'GI', A3: 'GIB', _id: 292 },
		{ name: 'GREECE', A2: 'GR', A3: 'GRC', _id: 300 },
		{ name: 'GREENLAND', A2: 'GL', A3: 'GRL', _id: 304 },
		{ name: 'GRENADA', A2: 'GD', A3: 'GRD', _id: 308 },
		{ name: 'GUADELOUPE', A2: 'GP', A3: 'GLP', _id: 312 },
		{ name: 'GUAM', A2: 'GU', A3: 'GUM', _id: 316 },
		{ name: 'GUATEMALA', A2: 'GT', A3: 'GTM', _id: 320 },
		{ name: 'GUINEA', A2: 'GN', A3: 'GIN', _id: 324 },
		{ name: 'GUINEA-BISSAU', A2: 'GW', A3: 'GNB', _id: 624 },
		{ name: 'GUYANA', A2: 'GY', A3: 'GUY', _id: 328 },
		{ name: 'HAITI', A2: 'HT', A3: 'HTI', _id: 332 },
		{ name: 'HEARD AND MC DONALD ISLANDS', A2: 'HM', A3: 'HMD', _id: 334 },
		{ name: 'HONDURAS', A2: 'HN', A3: 'HND', _id: 340 },
		{ name: 'HONG KONG', A2: 'HK', A3: 'HKG', _id: 344 },
		{ name: 'HUNGARY', A2: 'HU', A3: 'HUN', _id: 348 },
		{ name: 'ICELAND', A2: 'IS', A3: 'ISL', _id: 352 },
		{ name: 'INDIA', A2: 'IN', A3: 'IND', _id: 356 },
		{ name: 'INDONESIA', A2: 'ID', A3: 'IDN', _id: 360 },
		{ name: 'IRAN (ISLAMIC REPUBLIC OF)', A2: 'IR', A3: 'IRN', _id: 364 },
		{ name: 'IRAQ', A2: 'IQ', A3: 'IRQ', _id: 368 },
		{ name: 'IRELAND', A2: 'IE', A3: 'IRL', _id: 372 },
		{ name: 'ISRAEL', A2: 'IL', A3: 'ISR', _id: 376 },
		{ name: 'ITALY', A2: 'IT', A3: 'ITA', _id: 380 },
		{ name: 'JAMAICA', A2: 'JM', A3: 'JAM', _id: 388 },
		{ name: 'JAPAN', A2: 'JP', A3: 'JPN', _id: 392 },
		{ name: 'JORDAN', A2: 'JO', A3: 'JOR', _id: 400 },
		{ name: 'KAZAKHSTAN', A2: 'KZ', A3: 'KAZ', _id: 398 },
		{ name: 'KENYA', A2: 'KE', A3: 'KEN', _id: 404 },
		{ name: 'KIRIBATI', A2: 'KI', A3: 'KIR', _id: 296 },
		{ name: "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF", A2: 'KP', A3: 'PRK', _id: 408 },
		{ name: 'KOREA, REPUBLIC OF', A2: 'KR', A3: 'KOR', _id: 410 },
		{ name: 'KUWAIT', A2: 'KW', A3: 'KWT', _id: 414 },
		{ name: 'KYRGYZSTAN', A2: 'KG', A3: 'KGZ', _id: 417 },
		{ name: "LAO PEOPLE'S DEMOCRATIC REPUBLIC", A2: 'LA', A3: 'LAO', _id: 418 },
		{ name: 'LATVIA', A2: 'LV', A3: 'LVA', _id: 428 },
		{ name: 'LEBANON', A2: 'LB', A3: 'LBN', _id: 422 },
		{ name: 'LESOTHO', A2: 'LS', A3: 'LSO', _id: 426 },
		{ name: 'LIBERIA', A2: 'LR', A3: 'LBR', _id: 430 },
		{ name: 'LIBYAN ARAB JAMAHIRIYA', A2: 'LY', A3: 'LBY', _id: 434 },
		{ name: 'LIECHTENSTEIN', A2: 'LI', A3: 'LIE', _id: 438 },
		{ name: 'LITHUANIA', A2: 'LT', A3: 'LTU', _id: 440 },
		{ name: 'LUXEMBOURG', A2: 'LU', A3: 'LUX', _id: 442 },
		{ name: 'MACAU', A2: 'MO', A3: 'MAC', _id: 446 },
		{ name: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', A2: 'MK', A3: 'MKD', _id: 807 },
		{ name: 'MADAGASCAR', A2: 'MG', A3: 'MDG', _id: 450 },
		{ name: 'MALAWI', A2: 'MW', A3: 'MWI', _id: 454 },
		{ name: 'MALAYSIA', A2: 'MY', A3: 'MYS', _id: 458 },
		{ name: 'MALDIVES', A2: 'MV', A3: 'MDV', _id: 462 },
		{ name: 'MALI', A2: 'ML', A3: 'MLI', _id: 466 },
		{ name: 'MALTA', A2: 'MT', A3: 'MLT', _id: 470 },
		{ name: 'MARSHALL ISLANDS', A2: 'MH', A3: 'MHL', _id: 584 },
		{ name: 'MARTINIQUE', A2: 'MQ', A3: 'MTQ', _id: 474 },
		{ name: 'MAURITANIA', A2: 'MR', A3: 'MRT', _id: 478 },
		{ name: 'MAURITIUS', A2: 'MU', A3: 'MUS', _id: 480 },
		{ name: 'MAYOTTE', A2: 'YT', A3: 'MYT', _id: 175 },
		{ name: 'MEXICO', A2: 'MX', A3: 'MEX', _id: 484 },
		{ name: 'MICRONESIA, FEDERATED STATES OF', A2: 'FM', A3: 'FSM', _id: 583 },
		{ name: 'MOLDOVA, REPUBLIC OF', A2: 'MD', A3: 'MDA', _id: 498 },
		{ name: 'MONACO', A2: 'MC', A3: 'MCO', _id: 492 },
		{ name: 'MONGOLIA', A2: 'MN', A3: 'MNG', _id: 496 },
		{ name: 'MONTSERRAT', A2: 'MS', A3: 'MSR', _id: 500 },
		{ name: 'MOROCCO', A2: 'MA', A3: 'MAR', _id: 504 },
		{ name: 'MOZAMBIQUE', A2: 'MZ', A3: 'MOZ', _id: 508 },
		{ name: 'MYANMAR', A2: 'MM', A3: 'MMR', _id: 104 },
		{ name: 'NAMIBIA', A2: 'NA', A3: 'NAM', _id: 516 },
		{ name: 'NAURU', A2: 'NR', A3: 'NRU', _id: 520 },
		{ name: 'NEPAL', A2: 'NP', A3: 'NPL', _id: 524 },
		{ name: 'NETHERLANDS', A2: 'NL', A3: 'NLD', _id: 528 },
		{ name: 'NETHERLANDS ANTILLES', A2: 'AN', A3: 'ANT', _id: 530 },
		{ name: 'NEW CALEDONIA', A2: 'NC', A3: 'NCL', _id: 540 },
		{ name: 'NEW ZEALAND', A2: 'NZ', A3: 'NZL', _id: 554 },
		{ name: 'NICARAGUA', A2: 'NI', A3: 'NIC', _id: 558 },
		{ name: 'NIGER', A2: 'NE', A3: 'NER', _id: 562 },
		{ name: 'NIGERIA', A2: 'NG', A3: 'NGA', _id: 566 },
		{ name: 'NIUE', A2: 'NU', A3: 'NIU', _id: 570 },
		{ name: 'NORFOLK ISLAND', A2: 'NF', A3: 'NFK', _id: 574 },
		{ name: 'NORTHERN MARIANA ISLANDS', A2: 'MP', A3: 'MNP', _id: 580 },
		{ name: 'NORWAY', A2: 'NO', A3: 'NOR', _id: 578 },
		{ name: 'OMAN', A2: 'OM', A3: 'OMN', _id: 512 },
		{ name: 'PAKISTAN', A2: 'PK', A3: 'PAK', _id: 586 },
		{ name: 'PALAU', A2: 'PW', A3: 'PLW', _id: 585 },
		{ name: 'PALESTINIAN TERRITORY, Occupied', A2: 'PS', A3: 'PSE', _id: 275 },
		{ name: 'PANAMA', A2: 'PA', A3: 'PAN', _id: 591 },
		{ name: 'PAPUA NEW GUINEA', A2: 'PG', A3: 'PNG', _id: 598 },
		{ name: 'PARAGUAY', A2: 'PY', A3: 'PRY', _id: 600 },
		{ name: 'PERU', A2: 'PE', A3: 'PER', _id: 604 },
		{ name: 'PHILIPPINES', A2: 'PH', A3: 'PHL', _id: 608 },
		{ name: 'PITCAIRN', A2: 'PN', A3: 'PCN', _id: 612 },
		{ name: 'POLAND', A2: 'PL', A3: 'POL', _id: 616 },
		{ name: 'PORTUGAL', A2: 'PT', A3: 'PRT', _id: 620 },
		{ name: 'PUERTO RICO', A2: 'PR', A3: 'PRI', _id: 630 },
		{ name: 'QATAR', A2: 'QA', A3: 'QAT', _id: 634 },
		{ name: 'REUNION', A2: 'RE', A3: 'REU', _id: 638 },
		{ name: 'ROMANIA', A2: 'RO', A3: 'ROU', _id: 642 },
		{ name: 'RUSSIAN FEDERATION', A2: 'RU', A3: 'RUS', _id: 643 },
		{ name: 'RWANDA', A2: 'RW', A3: 'RWA', _id: 646 },
		{ name: 'SAINT HELENA', A2: 'SH', A3: 'SHN', _id: 654 },
		{ name: 'SAINT KITTS AND NEVIS', A2: 'KN', A3: 'KNA', _id: 659 },
		{ name: 'SAINT LUCIA', A2: 'LC', A3: 'LCA', _id: 662 },
		{ name: 'SAINT PIERRE AND MIQUELON', A2: 'PM', A3: 'SPM', _id: 666 },
		{ name: 'SAINT VINCENT AND THE GRENADINES', A2: 'VC', A3: 'VCT', _id: 670 },
		{ name: 'SAMOA', A2: 'WS', A3: 'WSM', _id: 882 },
		{ name: 'SAN MARINO', A2: 'SM', A3: 'SMR', _id: 674 },
		{ name: 'SAO TOME AND PRINCIPE', A2: 'ST', A3: 'STP', _id: 678 },
		{ name: 'SAUDI ARABIA', A2: 'SA', A3: 'SAU', _id: 682 },
		{ name: 'SENEGAL', A2: 'SN', A3: 'SEN', _id: 686 },
		{ name: 'SERBIA AND MONTENEGRO', A2: 'CS', A3: 'SCG', _id: 891 },
		{ name: 'SEYCHELLES', A2: 'SC', A3: 'SYC', _id: 690 },
		{ name: 'SIERRA LEONE', A2: 'SL', A3: 'SLE', _id: 694 },
		{ name: 'SINGAPORE', A2: 'SG', A3: 'SGP', _id: 702 },
		{ name: 'SLOVAKIA', A2: 'SK', A3: 'SVK', _id: 703 },
		{ name: 'SLOVENIA', A2: 'SI', A3: 'SVN', _id: 705 },
		{ name: 'SOLOMON ISLANDS', A2: 'SB', A3: 'SLB', _id: 90 },
		{ name: 'SOMALIA', A2: 'SO', A3: 'SOM', _id: 706 },
		{ name: 'SOUTH AFRICA', A2: 'ZA', A3: 'ZAF', _id: 710 },
		{ name: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', A2: 'GS', A3: 'SGS', _id: 239 },
		{ name: 'SPAIN', A2: 'ES', A3: 'ESP', _id: 724 },
		{ name: 'SRI LANKA', A2: 'LK', A3: 'LKA', _id: 144 },
		{ name: 'SUDAN', A2: 'SD', A3: 'SDN', _id: 736 },
		{ name: 'SURINAME', A2: 'SR', A3: 'SUR', _id: 740 },
		{ name: 'SVALBARD AND JAN MAYEN ISLANDS', A2: 'SJ', A3: 'SJM', _id: 744 },
		{ name: 'SWAZILAND', A2: 'SZ', A3: 'SWZ', _id: 748 },
		{ name: 'SWEDEN', A2: 'SE', A3: 'SWE', _id: 752 },
		{ name: 'SWITZERLAND', A2: 'CH', A3: 'CHE', _id: 756 },
		{ name: 'SYRIAN ARAB REPUBLIC', A2: 'SY', A3: 'SYR', _id: 760 },
		{ name: 'TAIWAN', A2: 'TW', A3: 'TWN', _id: 158 },
		{ name: 'TAJIKISTAN', A2: 'TJ', A3: 'TJK', _id: 762 },
		{ name: 'TANZANIA, UNITED REPUBLIC OF', A2: 'TZ', A3: 'TZA', _id: 834 },
		{ name: 'THAILAND', A2: 'TH', A3: 'THA', _id: 764 },
		{ name: 'TIMOR-LESTE', A2: 'TL', A3: 'TLS', _id: 626 },
		{ name: 'TOGO', A2: 'TG', A3: 'TGO', _id: 768 },
		{ name: 'TOKELAU', A2: 'TK', A3: 'TKL', _id: 772 },
		{ name: 'TONGA', A2: 'TO', A3: 'TON', _id: 776 },
		{ name: 'TRINIDAD AND TOBAGO', A2: 'TT', A3: 'TTO', _id: 780 },
		{ name: 'TUNISIA', A2: 'TN', A3: 'TUN', _id: 788 },
		{ name: 'TURKEY', A2: 'TR', A3: 'TUR', _id: 792 },
		{ name: 'TURKMENISTAN', A2: 'TM', A3: 'TKM', _id: 795 },
		{ name: 'TURKS AND CAICOS ISLANDS', A2: 'TC', A3: 'TCA', _id: 796 },
		{ name: 'TUVALU', A2: 'TV', A3: 'TUV', _id: 798 },
		{ name: 'UGANDA', A2: 'UG', A3: 'UGA', _id: 800 },
		{ name: 'UKRAINE', A2: 'UA', A3: 'UKR', _id: 804 },
		{ name: 'UNITED ARAB EMIRATES', A2: 'AE', A3: 'ARE', _id: 784 },
		{ name: 'UNITED KINGDOM', A2: 'GB', A3: 'GBR', _id: 826 },
		{ name: 'UNITED STATES', A2: 'US', A3: 'USA', _id: 840 },
		{ name: 'UNITED STATES MINOR OUTLYING ISLANDS', A2: 'UM', A3: 'UMI', _id: 581 },
		{ name: 'URUGUAY', A2: 'UY', A3: 'URY', _id: 858 },
		{ name: 'UZBEKISTAN', A2: 'UZ', A3: 'UZB', _id: 860 },
		{ name: 'VANUATU', A2: 'VU', A3: 'VUT', _id: 548 },
		{ name: 'VATICAN CITY STATE (HOLY SEE)', A2: 'VA', A3: 'VAT', _id: 336 },
		{ name: 'VENEZUELA', A2: 'VE', A3: 'VEN', _id: 862 },
		{ name: 'VIET NAM', A2: 'VN', A3: 'VNM', _id: 704 },
		{ name: 'VIRGIN ISLANDS (BRITISH)', A2: 'VG', A3: 'VGB', _id: 92 },
		{ name: 'VIRGIN ISLANDS (U.S.)', A2: 'VI', A3: 'VIR', _id: 850 },
		{ name: 'WALLIS AND FUTUNA ISLANDS', A2: 'WF', A3: 'WLF', _id: 876 },
		{ name: 'WESTERN SAHARA', A2: 'EH', A3: 'ESH', _id: 732 },
		{ name: 'YEMEN', A2: 'YE', A3: 'YEM', _id: 887 },
		{ name: 'ZAMBIA', A2: 'ZM', A3: 'ZMB', _id: 894 },
		{ name: 'ZIMBABWE', A2: 'ZW', A3: 'ZWE', _id: 716 }
	]
	var Company = require('../../models/company').Company
	let companyArr = await Company.find({})
	let items = [
		{ _id: 0, speed: 512 },
		{ _id: 1, speed: 720 },
		{ _id: 2, speed: 1024 },
		{ _id: 3, speed: 2048 }
	]
	let end_points = []
	for (let i = 0; i < 1000; i++)
		end_points.push({
			display_name: makeWord(5, 10),
			h323: makeWord(5, 10),
			sip: makeWord(5, 10),
			active: true,
			country: countryArr[getRandomInt(0, countryArr.length)]._id,
			company: companyArr[getRandomInt(0, companyArr.length)]._id,
			siret: makeWord(5, 10),
			zip: getRandomInt(10000, 100000),
			bandwidth: items[getRandomInt(0, items.length)]._id,
			gmt: getRandomInt(0, 26),
			type: 'end_point'
		})

	async.each(
		end_points,
		(userData, cb) => {
			let user = new End_Point(userData)
			user.save(cb)
		},
		err => {
			if (err) log.error('createEndPoints: ' + err)
		}
	)
}

exports.createMeeting = createMeeting
exports.createCompany = createCompany
exports.createBandwidth = createBandwidth
exports.createLang = createLang
exports.createGMT = createGMT
exports.createRole = createRole
exports.createCountry = createCountry
exports.createUsers = createUsers
exports.requireModels = requireModels
exports.createEndPoints = createEndPoints
