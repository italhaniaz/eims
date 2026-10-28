/**
 * Geographic Registry for Superadmin Institute Onboarding
 * Comprehensive hierarchical data mapping:
 * Country -> Regional Divisions & Affiliated Examination Boards
 * Country -> Provinces/States -> Auto-Detected Capital & City Lists
 */

export const GEOGRAPHIC_REGISTRY = {
  Pakistan: {
    code: 'PK',
    flag: '🇵🇰',
    phoneCode: '+92',
    currency: 'PKR',
    divisions: [
      { id: 'div-lhr', name: 'Lahore Division' },
      { id: 'div-rwp', name: 'Rawalpindi Division' },
      { id: 'div-fsd', name: 'Faisalabad Division' },
      { id: 'div-grw', name: 'Gujranwala Division' },
      { id: 'div-mul', name: 'Multan Division' },
      { id: 'div-bwp', name: 'Bahawalpur Division' },
      { id: 'div-swl', name: 'Sahiwal Division' },
      { id: 'div-sgd', name: 'Sargodha Division' },
      { id: 'div-dgk', name: 'Dera Ghazi Khan Division' },
      { id: 'div-gjt', name: 'Gujarat Division' },
      { id: 'div-khi', name: 'Karachi Division' },
      { id: 'div-hyd', name: 'Hyderabad Division' },
      { id: 'div-suk', name: 'Sukkur Division' },
      { id: 'div-lrk', name: 'Larkana Division' },
      { id: 'div-mpk', name: 'Mirpur Khas Division' },
      { id: 'div-sba', name: 'Shaheed Benazirabad Division' },
      { id: 'div-psh', name: 'Peshawar Division' },
      { id: 'div-mlk', name: 'Malakand Division' },
      { id: 'div-hzr', name: 'Hazara Division' },
      { id: 'div-mdn', name: 'Mardan Division' },
      { id: 'div-kht', name: 'Kohat Division' },
      { id: 'div-bnu', name: 'Bannu Division' },
      { id: 'div-dik', name: 'Dera Ismail Khan Division' },
      { id: 'div-qta', name: 'Quetta Division' },
      { id: 'div-mkr', name: 'Makran Division' },
      { id: 'div-klt', name: 'Kalat Division' },
      { id: 'div-isb', name: 'Islamabad Capital Territory' }
    ],
    boards: [
      { id: 'bise-lhr', name: 'BISE Lahore (Board of Intermediate & Secondary Education)', code: 'BISE Lahore' },
      { id: 'bise-rwp', name: 'BISE Rawalpindi', code: 'BISE Rawalpindi' },
      { id: 'bise-fsd', name: 'BISE Faisalabad', code: 'BISE Faisalabad' },
      { id: 'bise-grw', name: 'BISE Gujranwala', code: 'BISE Gujranwala' },
      { id: 'bise-mul', name: 'BISE Multan', code: 'BISE Multan' },
      { id: 'bise-bwp', name: 'BISE Bahawalpur', code: 'BISE Bahawalpur' },
      { id: 'bise-swl', name: 'BISE Sahiwal', code: 'BISE Sahiwal' },
      { id: 'bise-sgd', name: 'BISE Sargodha', code: 'BISE Sargodha' },
      { id: 'bise-dgk', name: 'BISE D.G. Khan', code: 'BISE D.G. Khan' },
      { id: 'fbise-isb', name: 'Federal Board of Intermediate & Secondary Education (FBISE)', code: 'Federal Board (FBISE)' },
      { id: 'biek-khi', name: 'BIEK Karachi (Board of Intermediate Education)', code: 'BIEK Karachi' },
      { id: 'bsek-khi', name: 'BSEK Karachi (Board of Secondary Education)', code: 'BSEK Karachi' },
      { id: 'bise-hyd', name: 'BISE Hyderabad', code: 'BISE Hyderabad' },
      { id: 'bise-suk', name: 'BISE Sukkur', code: 'BISE Sukkur' },
      { id: 'bise-lrk', name: 'BISE Larkana', code: 'BISE Larkana' },
      { id: 'bise-mpk', name: 'BISE Mirpurkhas', code: 'BISE Mirpurkhas' },
      { id: 'bise-sba', name: 'BISE Shaheed Benazirabad', code: 'BISE Shaheed Benazirabad' },
      { id: 'bise-psh', name: 'BISE Peshawar', code: 'BISE Peshawar' },
      { id: 'bise-abt', name: 'BISE Abbottabad', code: 'BISE Abbottabad' },
      { id: 'bise-mdn', name: 'BISE Mardan', code: 'BISE Mardan' },
      { id: 'bise-swt', name: 'BISE Swat', code: 'BISE Swat' },
      { id: 'bise-mlk', name: 'BISE Malakand', code: 'BISE Malakand' },
      { id: 'bise-kht', name: 'BISE Kohat', code: 'BISE Kohat' },
      { id: 'bise-bnu', name: 'BISE Bannu', code: 'BISE Bannu' },
      { id: 'bise-dik', name: 'BISE D.I. Khan', code: 'BISE D.I. Khan' },
      { id: 'bise-qta', name: 'BISE Quetta', code: 'BISE Quetta' },
      { id: 'bise-ajk', name: 'BISE Mirpur (AJK Board)', code: 'BISE Mirpur AJK' },
      { id: 'caie-pk', name: 'Cambridge Assessment International Education (CAIE - O/A Levels)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'aku-eb', name: 'Aga Khan University Examination Board (AKU-EB)', code: 'AKU-EB' },
      { id: 'edexcel-pk', name: 'Pearson Edexcel International', code: 'Pearson Edexcel' },
      { id: 'ib-pk', name: 'International Baccalaureate (IB World School)', code: 'IB World School' }
    ],
    provinces: {
      'Punjab': {
        capitalCity: 'Lahore',
        cities: [
          'Lahore',
          'Rawalpindi',
          'Faisalabad',
          'Gujranwala',
          'Multan',
          'Sialkot',
          'Kasur',
          'Bahawalpur',
          'Sargodha',
          'Sheikhupura',
          'Sahiwal',
          'Gujrat',
          'Jhelum',
          'Rahim Yar Khan',
          'Okara',
          'Chiniot',
          'Mianwali',
          'Murree',
          'Attock',
          'Dera Ghazi Khan',
          'Hafizabad',
          'Khanewal',
          'Muzaffargarh',
          'Vehari',
          'Mandi Bahauddin',
          'Chakwal',
          'Pakpattan',
          'Toba Tek Singh',
          'Bhakkar',
          'Layyah',
          'Lodhran',
          'Nankana Sahib',
          'Narowal',
          'Rajanpur'
        ]
      },
      'Sindh': {
        capitalCity: 'Karachi',
        cities: [
          'Karachi',
          'Hyderabad',
          'Sukkur',
          'Larkana',
          'Mirpur Khas',
          'Nawabshah (Shaheed Benazirabad)',
          'Thatta',
          'Jacobabad',
          'Shikarpur',
          'Badin',
          'Khairpur',
          'Ghotki',
          'Dadu',
          'Tando Allahyar',
          'Umerkot',
          'Sanghar',
          'Jamshoro'
        ]
      },
      'Khyber Pakhtunkhwa (KPK)': {
        capitalCity: 'Peshawar',
        cities: [
          'Peshawar',
          'Abbottabad',
          'Mardan',
          'Swat (Mingora)',
          'Kohat',
          'Dera Ismail Khan',
          'Haripur',
          'Mansehra',
          'Nowshera',
          'Charsadda',
          'Swabi',
          'Bannu',
          'Batkhela',
          'Chitral',
          'Malakand',
          'Dir'
        ]
      },
      'Balochistan': {
        capitalCity: 'Quetta',
        cities: [
          'Quetta',
          'Gwadar',
          'Turbat',
          'Khuzdar',
          'Hub',
          'Sibi',
          'Chaman',
          'Loralai',
          'Zhob',
          'Dera Murad Jamali',
          'Pishin',
          'Kalat',
          'Mastung'
        ]
      },
      'Islamabad Capital Territory (ICT)': {
        capitalCity: 'Islamabad',
        cities: [
          'Islamabad',
          'Rawat',
          'Tarlai',
          'Bhara Kahu'
        ]
      },
      'Azad Jammu & Kashmir (AJK)': {
        capitalCity: 'Muzaffarabad',
        cities: [
          'Muzaffarabad',
          'Mirpur',
          'Rawalakot',
          'Kotli',
          'Bhimber',
          'Bagh',
          'Pallandri'
        ]
      },
      'Gilgit-Baltistan (GB)': {
        capitalCity: 'Gilgit',
        cities: [
          'Gilgit',
          'Skardu',
          'Hunza',
          'Diamer (Chilas)',
          'Ghizer',
          'Ghanche',
          'Astore'
        ]
      }
    }
  },
  'United Arab Emirates': {
    code: 'AE',
    flag: '🇦🇪',
    phoneCode: '+971',
    currency: 'AED',
    divisions: [
      { id: 'div-dxb', name: 'Dubai Educational Zone' },
      { id: 'div-auh', name: 'Abu Dhabi Educational Zone' },
      { id: 'div-shj', name: 'Sharjah Educational Zone' },
      { id: 'div-ajm', name: 'Ajman Educational Zone' },
      { id: 'div-rak', name: 'Ras Al Khaimah Educational Zone' },
      { id: 'div-fuj', name: 'Fujairah Educational Zone' },
      { id: 'div-uaq', name: 'Umm Al Quwain Educational Zone' }
    ],
    boards: [
      { id: 'moe-uae', name: 'UAE Ministry of Education (MOE)', code: 'MOE UAE' },
      { id: 'khda-dxb', name: 'KHDA Dubai (Knowledge & Human Development Authority)', code: 'KHDA Dubai' },
      { id: 'adek-auh', name: 'ADEK (Abu Dhabi Dept of Education & Knowledge)', code: 'ADEK Abu Dhabi' },
      { id: 'caie-uae', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-uae', name: 'International Baccalaureate (IB Gulf)', code: 'IB World School' },
      { id: 'edexcel-uae', name: 'Pearson Edexcel Middle East', code: 'Pearson Edexcel' },
      { id: 'cbse-uae', name: 'CBSE Gulf Sahodaya (UAE Region)', code: 'CBSE UAE' },
      { id: 'fbise-uae', name: 'FBISE (Federal Board UAE Sub-Office)', code: 'Federal Board (FBISE UAE)' }
    ],
    provinces: {
      'Dubai': {
        capitalCity: 'Dubai',
        cities: ['Dubai', 'Deira', 'Bur Dubai', 'Jumeirah', 'Al Barsha', 'Dubai Silicon Oasis', 'Downtown Dubai', 'Mirdif']
      },
      'Abu Dhabi': {
        capitalCity: 'Abu Dhabi',
        cities: ['Abu Dhabi', 'Al Ain', 'Al Dhafra', 'Madinat Zayed', 'Ruwais', 'Khalifa City', 'Musaffah']
      },
      'Sharjah': {
        capitalCity: 'Sharjah',
        cities: ['Sharjah', 'Khor Fakkan', 'Kalba', 'Dibba Al-Hisn', 'Al Dhaid']
      },
      'Ajman': {
        capitalCity: 'Ajman',
        cities: ['Ajman', 'Masfout', 'Manama']
      },
      'Ras Al Khaimah': {
        capitalCity: 'Ras Al Khaimah',
        cities: ['Ras Al Khaimah', 'Al Jazirah Al Hamra', 'Digdaga']
      },
      'Fujairah': {
        capitalCity: 'Fujairah',
        cities: ['Fujairah', 'Dibba Al-Fujairah', 'Al Bidya']
      },
      'Umm Al Quwain': {
        capitalCity: 'Umm Al Quwain',
        cities: ['Umm Al Quwain', 'Falaj Al Mualla']
      }
    }
  },
  'Saudi Arabia': {
    code: 'SA',
    flag: '🇸🇦',
    phoneCode: '+966',
    currency: 'SAR',
    divisions: [
      { id: 'div-ryd', name: 'Riyadh Directorate General of Education' },
      { id: 'div-jdh', name: 'Jeddah / Makkah Educational Directorate' },
      { id: 'div-dmm', name: 'Eastern Province Educational Directorate' },
      { id: 'div-med', name: 'Madinah Directorate of Education' },
      { id: 'div-asr', name: 'Asir Educational Region' },
      { id: 'div-qsm', name: 'Al-Qassim Educational Directorate' }
    ],
    boards: [
      { id: 'moe-ksa', name: 'Saudi Ministry of Education (MOE KSA)', code: 'MOE KSA' },
      { id: 'caie-ksa', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-ksa', name: 'International Baccalaureate (IB Saudi)', code: 'IB World School' },
      { id: 'edexcel-ksa', name: 'Pearson Edexcel Middle East', code: 'Pearson Edexcel' },
      { id: 'cbse-ksa', name: 'CBSE Gulf Sahodaya (Saudi Arabia)', code: 'CBSE KSA' },
      { id: 'fbise-ksa', name: 'FBISE (Federal Board KSA Chapter)', code: 'Federal Board (FBISE KSA)' }
    ],
    provinces: {
      'Riyadh Province': {
        capitalCity: 'Riyadh',
        cities: ['Riyadh', 'Al Kharj', 'Ad Diriyah', 'Al Majma\'ah', 'Dawadmi', 'Wadi Ad-Dawasir']
      },
      'Makkah Province': {
        capitalCity: 'Makkah',
        cities: ['Makkah', 'Jeddah', 'Taif', 'Rabigh', 'Al Qunfudhah']
      },
      'Eastern Province': {
        capitalCity: 'Dammam',
        cities: ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Al Ahsa (Hofuf)', 'Qatif', 'Hafar Al-Batin']
      },
      'Madinah Province': {
        capitalCity: 'Madinah',
        cities: ['Madinah', 'Yanbu', 'Al-Ula', 'Badr']
      },
      'Asir Province': {
        capitalCity: 'Abha',
        cities: ['Abha', 'Khamis Mushait', 'Bisha', 'Mahayil']
      },
      'Al-Qassim Province': {
        capitalCity: 'Buraidah',
        cities: ['Buraidah', 'Unaizah', 'Al Rass']
      },
      'Tabuk Province': {
        capitalCity: 'Tabuk',
        cities: ['Tabuk', 'Duba', 'Haql', 'Tayma']
      }
    }
  },
  'United Kingdom': {
    code: 'GB',
    flag: '🇬🇧',
    phoneCode: '+44',
    currency: 'GBP',
    divisions: [
      { id: 'div-ldn', name: 'Greater London Education Authority' },
      { id: 'div-wm', name: 'West Midlands Education Region' },
      { id: 'div-gm', name: 'Greater Manchester Education Region' },
      { id: 'div-sct', name: 'Scotland Regional Education Board' },
      { id: 'div-wls', name: 'Wales Education Directorate' },
      { id: 'div-ni', name: 'Northern Ireland Education Authority' }
    ],
    boards: [
      { id: 'caie-uk', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'edexcel-uk', name: 'Pearson Edexcel', code: 'Pearson Edexcel' },
      { id: 'aqa-uk', name: 'AQA (Assessment and Qualifications Alliance)', code: 'AQA Examination Board' },
      { id: 'ocr-uk', name: 'OCR (Oxford, Cambridge and RSA Examinations)', code: 'OCR Board' },
      { id: 'ib-uk', name: 'International Baccalaureate (IB UK)', code: 'IB World School' },
      { id: 'sqa-uk', name: 'SQA (Scottish Qualifications Authority)', code: 'SQA Scotland' }
    ],
    provinces: {
      'England': {
        capitalCity: 'London',
        cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol', 'Sheffield', 'Newcastle', 'Nottingham', 'Oxford', 'Cambridge', 'Leicester', 'Southampton']
      },
      'Scotland': {
        capitalCity: 'Edinburgh',
        cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Perth']
      },
      'Wales': {
        capitalCity: 'Cardiff',
        cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor']
      },
      'Northern Ireland': {
        capitalCity: 'Belfast',
        cities: ['Belfast', 'Derry / Londonderry', 'Lisburn', 'Newry', 'Bangor NI']
      }
    }
  },
  'United States': {
    code: 'US',
    flag: '🇺🇸',
    phoneCode: '+1',
    currency: 'USD',
    divisions: [
      { id: 'div-ca', name: 'California Education District' },
      { id: 'div-tx', name: 'Texas Education Agency Region' },
      { id: 'div-ny', name: 'New York State Board of Regents' },
      { id: 'div-fl', name: 'Florida Department of Education Region' },
      { id: 'div-il', name: 'Illinois State Board of Education' },
      { id: 'div-wa', name: 'Washington State OSPI District' }
    ],
    boards: [
      { id: 'cb-us', name: 'College Board (Advanced Placement & SAT)', code: 'College Board (AP)' },
      { id: 'ib-us', name: 'International Baccalaureate (IB Americas)', code: 'IB Americas' },
      { id: 'act-us', name: 'ACT Education Board', code: 'ACT Board' },
      { id: 'cam-us', name: 'Cambridge International USA', code: 'Cambridge USA' },
      { id: 'state-us', name: 'State Board of Education Accreditation', code: 'State Board' }
    ],
    provinces: {
      'California': {
        capitalCity: 'Sacramento',
        cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Oakland', 'Irvine', 'Pasadena']
      },
      'Texas': {
        capitalCity: 'Austin',
        cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano']
      },
      'New York': {
        capitalCity: 'Albany',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers']
      },
      'Florida': {
        capitalCity: 'Tallahassee',
        cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee', 'Fort Lauderdale', 'St. Petersburg']
      },
      'Illinois': {
        capitalCity: 'Springfield',
        cities: ['Chicago', 'Aurora', 'Naperville', 'Springfield', 'Rockford', 'Joliet']
      },
      'Washington': {
        capitalCity: 'Olympia',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver WA', 'Bellevue', 'Olympia']
      }
    }
  },
  'Canada': {
    code: 'CA',
    flag: '🇨🇦',
    phoneCode: '+1',
    currency: 'CAD',
    divisions: [
      { id: 'div-on', name: 'Ontario Ministry of Education' },
      { id: 'div-bc', name: 'British Columbia Ministry of Education' },
      { id: 'div-qc', name: 'Quebec Ministry of Education' },
      { id: 'div-ab', name: 'Alberta Education Directorate' }
    ],
    boards: [
      { id: 'ossd-ca', name: 'Ontario Secondary School Diploma (OSSD)', code: 'OSSD Ontario' },
      { id: 'bc-ca', name: 'British Columbia Ministry of Education Board', code: 'BC Dogwood Diploma' },
      { id: 'ab-ca', name: 'Alberta High School Diploma Board', code: 'Alberta Board' },
      { id: 'ib-ca', name: 'International Baccalaureate (IB Canada)', code: 'IB Canada' },
      { id: 'cam-ca', name: 'Cambridge International Canada', code: 'Cambridge Canada' }
    ],
    provinces: {
      'Ontario': {
        capitalCity: 'Toronto',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London ON', 'Markham', 'Waterloo']
      },
      'British Columbia': {
        capitalCity: 'Victoria',
        cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna']
      },
      'Quebec': {
        capitalCity: 'Quebec City',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil']
      },
      'Alberta': {
        capitalCity: 'Edmonton',
        cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert']
      }
    }
  },
  'Qatar': {
    code: 'QA',
    flag: '🇶🇦',
    phoneCode: '+974',
    currency: 'QAR',
    divisions: [
      { id: 'div-doh', name: 'Doha Central Educational Zone' },
      { id: 'div-ray', name: 'Al Rayyan Educational Zone' },
      { id: 'div-wkr', name: 'Al Wakrah Educational Zone' }
    ],
    boards: [
      { id: 'moe-qa', name: 'Qatar Ministry of Education & Higher Education', code: 'MOE Qatar' },
      { id: 'caie-qa', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-qa', name: 'International Baccalaureate (IB Qatar)', code: 'IB World School' },
      { id: 'edexcel-qa', name: 'Pearson Edexcel Qatar', code: 'Pearson Edexcel' },
      { id: 'cbse-qa', name: 'CBSE Gulf Sahodaya (Qatar)', code: 'CBSE Qatar' },
      { id: 'fbise-qa', name: 'FBISE (Federal Board Qatar Chapter)', code: 'Federal Board (FBISE Qatar)' }
    ],
    provinces: {
      'Doha': {
        capitalCity: 'Doha',
        cities: ['Doha', 'West Bay', 'The Pearl', 'Madinat Khalifa', 'Al Sadd']
      },
      'Al Rayyan': {
        capitalCity: 'Al Rayyan',
        cities: ['Al Rayyan', 'Education City', 'Al Wajbah', 'Abu Hamour']
      },
      'Al Wakrah': {
        capitalCity: 'Al Wakrah',
        cities: ['Al Wakrah', 'Mesaieed', 'Al Wukair']
      },
      'Al Khor': {
        capitalCity: 'Al Khor',
        cities: ['Al Khor', 'Ras Laffan', 'Al Thakhira']
      }
    }
  },
  'Oman': {
    code: 'OM',
    flag: '🇴🇲',
    phoneCode: '+968',
    currency: 'OMR',
    divisions: [
      { id: 'div-mct', name: 'Muscat Directorate of Education' },
      { id: 'div-dhf', name: 'Dhofar Regional Education Directorate' },
      { id: 'div-btn', name: 'Al Batinah Directorate of Education' }
    ],
    boards: [
      { id: 'moe-om', name: 'Oman Ministry of Education (MOE)', code: 'MOE Oman' },
      { id: 'caie-om', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-om', name: 'International Baccalaureate (IB Oman)', code: 'IB World School' },
      { id: 'edexcel-om', name: 'Pearson Edexcel Oman', code: 'Pearson Edexcel' },
      { id: 'cbse-om', name: 'CBSE Gulf Sahodaya (Oman)', code: 'CBSE Oman' },
      { id: 'fbise-om', name: 'FBISE (Federal Board Oman Chapter)', code: 'Federal Board (FBISE Oman)' }
    ],
    provinces: {
      'Muscat': {
        capitalCity: 'Muscat',
        cities: ['Muscat', 'Seeb', 'Muttrah', 'Bawshar', 'Al Amerat']
      },
      'Dhofar': {
        capitalCity: 'Salalah',
        cities: ['Salalah', 'Taqah', 'Mirbat']
      },
      'Al Batinah': {
        capitalCity: 'Sohar',
        cities: ['Sohar', 'Rustaq', 'Barka', 'Saham']
      }
    }
  },
  'Bahrain': {
    code: 'BH',
    flag: '🇧🇭',
    phoneCode: '+973',
    currency: 'BHD',
    divisions: [
      { id: 'div-mnm', name: 'Bahrain Central Educational Zone' },
      { id: 'div-mhq', name: 'Muharraq Educational Zone' }
    ],
    boards: [
      { id: 'moe-bh', name: 'Bahrain Ministry of Education', code: 'MOE Bahrain' },
      { id: 'caie-bh', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-bh', name: 'International Baccalaureate (IB Bahrain)', code: 'IB World School' },
      { id: 'edexcel-bh', name: 'Pearson Edexcel Bahrain', code: 'Pearson Edexcel' },
      { id: 'cbse-bh', name: 'CBSE Gulf Sahodaya (Bahrain)', code: 'CBSE Bahrain' }
    ],
    provinces: {
      'Capital Governorate': {
        capitalCity: 'Manama',
        cities: ['Manama', 'Juffair', 'Seef']
      },
      'Muharraq': {
        capitalCity: 'Muharraq',
        cities: ['Muharraq', 'Busaiteen', 'Amwaj Islands']
      },
      'Northern Governorate': {
        capitalCity: 'Saar',
        cities: ['Saar', 'Budaiya', 'Hamad Town']
      },
      'Southern Governorate': {
        capitalCity: 'Riffa',
        cities: ['Riffa', 'Isa Town', 'Zallaq']
      }
    }
  },
  'Kuwait': {
    code: 'KW',
    flag: '🇰🇼',
    phoneCode: '+965',
    currency: 'KWD',
    divisions: [
      { id: 'div-kwt-c', name: 'Capital Educational Area' },
      { id: 'div-hwl', name: 'Hawalli Educational Area' },
      { id: 'div-frw', name: 'Farwaniya Educational Area' }
    ],
    boards: [
      { id: 'moe-kw', name: 'Kuwait Ministry of Education', code: 'MOE Kuwait' },
      { id: 'caie-kw', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-kw', name: 'International Baccalaureate (IB Kuwait)', code: 'IB World School' },
      { id: 'edexcel-kw', name: 'Pearson Edexcel Kuwait', code: 'Pearson Edexcel' },
      { id: 'cbse-kw', name: 'CBSE Gulf Sahodaya (Kuwait)', code: 'CBSE Kuwait' },
      { id: 'fbise-kw', name: 'FBISE (Federal Board Kuwait Chapter)', code: 'Federal Board (FBISE Kuwait)' }
    ],
    provinces: {
      'Capital Governorate': {
        capitalCity: 'Kuwait City',
        cities: ['Kuwait City', 'Dasman', 'Sharq', 'Mirqab']
      },
      'Hawalli': {
        capitalCity: 'Hawalli',
        cities: ['Hawalli', 'Salmiya', 'Jabriya', 'Bayan']
      },
      'Farwaniya': {
        capitalCity: 'Farwaniya',
        cities: ['Farwaniya', 'Khaitan', 'Al-Andalus']
      },
      'Ahmadi': {
        capitalCity: 'Ahmadi',
        cities: ['Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula']
      }
    }
  },
  'Australia': {
    code: 'AU',
    flag: '🇦🇺',
    phoneCode: '+61',
    currency: 'AUD',
    divisions: [
      { id: 'div-nsw', name: 'NSW Department of Education Region' },
      { id: 'div-vic', name: 'Victoria Department of Education Region' },
      { id: 'div-qld', name: 'Queensland Department of Education Region' }
    ],
    boards: [
      { id: 'hsc-nsw', name: 'NSW Higher School Certificate (HSC) Board', code: 'NSW HSC' },
      { id: 'vce-vic', name: 'Victorian Certificate of Education (VCE) Board', code: 'VCE Victoria' },
      { id: 'qce-qld', name: 'Queensland Certificate of Education (QCE) Board', code: 'QCE Queensland' },
      { id: 'ib-au', name: 'International Baccalaureate (IB Australia)', code: 'IB Australia' },
      { id: 'cam-au', name: 'Cambridge International Australia', code: 'Cambridge Australia' }
    ],
    provinces: {
      'New South Wales': {
        capitalCity: 'Sydney',
        cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast']
      },
      'Victoria': {
        capitalCity: 'Melbourne',
        cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo']
      },
      'Queensland': {
        capitalCity: 'Brisbane',
        cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville']
      },
      'Western Australia': {
        capitalCity: 'Perth',
        cities: ['Perth', 'Fremantle', 'Bunbury']
      }
    }
  },
  'Other / International': {
    code: 'INT',
    flag: '🌐',
    phoneCode: '+1',
    currency: 'USD',
    divisions: [
      { id: 'div-int-c', name: 'Central Regional Division' },
      { id: 'div-int-n', name: 'Northern Regional Division' },
      { id: 'div-int-s', name: 'Southern Regional Division' },
      { id: 'div-int-e', name: 'Eastern Regional Division' },
      { id: 'div-int-w', name: 'Western Regional Division' }
    ],
    boards: [
      { id: 'caie-int', name: 'Cambridge Assessment International Education (CAIE)', code: 'Cambridge Assessment (CAIE)' },
      { id: 'ib-int', name: 'International Baccalaureate (IB Global)', code: 'IB World School' },
      { id: 'edexcel-int', name: 'Pearson Edexcel International', code: 'Pearson Edexcel' },
      { id: 'national-int', name: 'National Ministry of Education / State Board', code: 'National Board' }
    ],
    provinces: {
      'Central Region': {
        capitalCity: 'Main Metropolis',
        cities: ['Main Metropolis', 'Downtown District', 'Uptown District', 'Capital Center']
      },
      'Northern Region': {
        capitalCity: 'Northern Metro',
        cities: ['Northern Metro', 'Highland City', 'River Valley']
      },
      'Southern Region': {
        capitalCity: 'Southern Harbor',
        cities: ['Southern Harbor', 'Coastal City', 'Port District']
      },
      'Eastern Region': {
        capitalCity: 'Eastern Hub',
        cities: ['Eastern Hub', 'Sunrise Valley', 'East Campus City']
      },
      'Western Region': {
        capitalCity: 'Western Center',
        cities: ['Western Center', 'Golden Valley', 'West Metro']
      }
    }
  }
}

/**
 * Returns list of available countries formatted for dropdowns
 */
export const getAvailableCountries = () => {
  return Object.keys(GEOGRAPHIC_REGISTRY).map(countryName => ({
    name: countryName,
    code: GEOGRAPHIC_REGISTRY[countryName].code,
    flag: GEOGRAPHIC_REGISTRY[countryName].flag,
    phoneCode: GEOGRAPHIC_REGISTRY[countryName].phoneCode
  }))
}

/**
 * Returns divisions for a selected country
 */
export const getCountryDivisions = (countryName) => {
  const country = GEOGRAPHIC_REGISTRY[countryName] || GEOGRAPHIC_REGISTRY['Pakistan']
  return country.divisions || []
}

/**
 * Returns examination boards for a selected country
 */
export const getCountryBoards = (countryName) => {
  const country = GEOGRAPHIC_REGISTRY[countryName] || GEOGRAPHIC_REGISTRY['Pakistan']
  return country.boards || []
}

/**
 * Returns list of provinces / states for a selected country
 */
export const getCountryProvinces = (countryName) => {
  const country = GEOGRAPHIC_REGISTRY[countryName] || GEOGRAPHIC_REGISTRY['Pakistan']
  return Object.keys(country.provinces || {})
}

/**
 * Returns cities for a selected province in a country
 */
export const getProvinceCities = (countryName, provinceName) => {
  const country = GEOGRAPHIC_REGISTRY[countryName] || GEOGRAPHIC_REGISTRY['Pakistan']
  const province = country.provinces?.[provinceName]
  return province?.cities || []
}

/**
 * Returns the capital / primary city for a selected province in a country
 */
export const getProvinceCapital = (countryName, provinceName) => {
  const country = GEOGRAPHIC_REGISTRY[countryName] || GEOGRAPHIC_REGISTRY['Pakistan']
  const province = country.provinces?.[provinceName]
  return province?.capitalCity || province?.cities?.[0] || ''
}

/**
 * Returns typical phone placeholder based on country calling code
 */
export const getPhonePlaceholder = (dialCode) => {
  switch (dialCode) {
    case '+92':
      return 'e.g. 300 1234567 or 42 35789012'
    case '+971':
      return 'e.g. 50 1234567 or 4 1234567'
    case '+966':
      return 'e.g. 50 1234567 or 11 1234567'
    case '+44':
      return 'e.g. 7123 456789 or 20 7946 0912'
    case '+1':
      return 'e.g. 555 123 4567'
    case '+974':
      return 'e.g. 3312 3456'
    case '+968':
      return 'e.g. 9123 4567'
    case '+973':
      return 'e.g. 3612 3456'
    case '+965':
      return 'e.g. 9123 4567'
    case '+61':
      return 'e.g. 412 345 678'
    default:
      return 'e.g. 300 1234567'
  }
}

