import { FeedSource } from "@/types";

export const FEEDS: FeedSource[] = [
  // ══════════════════════════════════════
  // 국내뉴스 (domestic)
  // ══════════════════════════════════════

  // — 경제 전문 피드
  // — Economy specialized feeds
  { name: "한국경제", url: "https://www.hankyung.com/feed/economy", category: "domestic" },
  { name: "한국경제 증권", url: "https://www.hankyung.com/feed/finance", category: "domestic" },
  { name: "한국경제 부동산", url: "https://www.hankyung.com/feed/realestate", category: "domestic" },
  { name: "매일경제", url: "https://www.mk.co.kr/rss/30100041/", category: "domestic" },
  { name: "머니투데이", url: "https://rss.mt.co.kr/mt_economy.xml", category: "domestic" },
  { name: "이데일리", url: "https://www.edaily.co.kr/rss/economy.xml", category: "domestic" },
  { name: "서울경제", url: "https://www.sedaily.com/Rss/Economy", category: "domestic" },
  { name: "아시아경제", url: "https://www.asiae.co.kr/rss/economy.xml", category: "domestic" },
  { name: "헤럴드경제", url: "http://biz.heraldcorp.com/common_prog/rss498.php?page_code=010", category: "domestic" },
  { name: "조선비즈", url: "https://biz.chosun.com/svc/rss/www/rss.xml", category: "domestic" },
  { name: "뉴시스", url: "https://newsis.com/RSS/economy.xml", category: "domestic" },
  // — 일반 피드 (broad → 키워드 필터)
  // — General feeds (broad → keyword filter)
  { name: "연합뉴스", url: "http://www.yonhapnews.co.kr/RSS/economy.xml", category: "domestic" },
  { name: "SBS", url: "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=02&plink=RSSREADER", category: "domestic" },
  { name: "MBC", url: "http://imnews.imbc.com/rss/news/news_04.xml", category: "domestic" },
  { name: "KBS", url: "https://news.kbs.co.kr/api/rss/rss.php?rcnt=10&ctgr=EK", category: "domestic" },
  { name: "파이낸셜뉴스", url: "https://www.fnnews.com/rss/fn_economy.xml", category: "domestic" },
  { name: "뉴스1", url: "https://www.news1.kr/rss/economy", category: "domestic" },
  { name: "한국일보", url: "https://rss.hankooki.com/news/hk_economy.xml", category: "domestic" },
  { name: "한겨레", url: "https://www.hani.co.kr/rss/economy/", category: "domestic" },
  { name: "경향신문", url: "https://www.khan.co.kr/rss/rssdata/economy_news.xml", category: "domestic" },
  { name: "Google 경제", url: "https://news.google.com/rss/search?q=한국+경제+금리+물가&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 부동산", url: "https://news.google.com/rss/search?q=부동산+아파트+전세+매매&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },

  // — 정치 피드 (투자 관련만 필터, broad: true)
  // — Politics feeds (investment-relevant only, broad: true)
  { name: "한국경제", url: "https://www.hankyung.com/feed/politics", category: "domestic", broad: true },
  { name: "매일경제", url: "https://www.mk.co.kr/rss/30200030/", category: "domestic", broad: true },
  { name: "뉴시스", url: "https://newsis.com/RSS/politics.xml", category: "domestic", broad: true },
  { name: "연합뉴스", url: "http://www.yonhapnews.co.kr/RSS/politics.xml", category: "domestic", broad: true },
  { name: "SBS", url: "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01&plink=RSSREADER", category: "domestic", broad: true },
  { name: "MBC", url: "http://imnews.imbc.com/rss/news/news_01.xml", category: "domestic", broad: true },
  { name: "KBS", url: "https://news.kbs.co.kr/api/rss/rss.php?rcnt=10&ctgr=PO", category: "domestic", broad: true },
  { name: "한겨레", url: "https://www.hani.co.kr/rss/politics/", category: "domestic", broad: true },
  { name: "경향신문", url: "https://www.khan.co.kr/rss/rssdata/politic_news.xml", category: "domestic", broad: true },
  { name: "Google 정치", url: "https://news.google.com/rss/search?q=한국+정치+국회+대통령&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 외교", url: "https://news.google.com/rss/search?q=한국+외교+안보+북한&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },

  // — 국내 증권 전문 (한국경제 증권, 매일경제는 위에서 이미 등록됨)
  // — Korean stocks specialized feeds (hankyung finance, mk already registered above)
  { name: "이데일리 증권", url: "https://www.edaily.co.kr/rss/stock.xml", category: "domestic" },
  { name: "머니투데이 증권", url: "https://rss.mt.co.kr/mt_stock.xml", category: "domestic" },
  { name: "서울경제 증권", url: "https://www.sedaily.com/Rss/Stock", category: "domestic" },
  { name: "아시아경제 증권", url: "https://www.asiae.co.kr/rss/stock.xml", category: "domestic" },
  { name: "헤럴드 증권", url: "http://biz.heraldcorp.com/common_prog/rss498.php?page_code=020", category: "domestic" },
  // — 국내 증권 Google 검색
  // — Korean stocks Google search
  { name: "Google 코스피", url: "https://news.google.com/rss/search?q=코스피+코스닥+증시+주식&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 삼성전자", url: "https://news.google.com/rss/search?q=삼성전자+SK하이닉스+주가&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google ETF", url: "https://news.google.com/rss/search?q=ETF+배당+공모주+IPO&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },

  // — 국내 추가 피드
  // — Additional domestic feeds
  { name: "조선일보 경제", url: "https://www.chosun.com/rss/economy/", category: "domestic" },
  { name: "중앙일보 경제", url: "https://rss.joins.com/joins_economy_list.xml", category: "domestic" },
  { name: "동아일보 경제", url: "https://rss.donga.com/economy.xml", category: "domestic" },
  { name: "이투데이", url: "https://www.etoday.co.kr/rss/economy.xml", category: "domestic" },
  { name: "Google 채권금리", url: "https://news.google.com/rss/search?q=채권+금리+국채+통안채&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 선물옵션", url: "https://news.google.com/rss/search?q=선물+옵션+파생상품&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 환율", url: "https://news.google.com/rss/search?q=환율+원달러+외환시장&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 한국은행", url: "https://news.google.com/rss/search?q=한국은행+기준금리+통화정책&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },
  { name: "Google 반도체", url: "https://news.google.com/rss/search?q=반도체+삼성전자+SK하이닉스+HBM&hl=ko&gl=KR&ceid=KR:ko", category: "domestic", broad: true },

  // ══════════════════════════════════════
  // 해외뉴스 (international)
  // ══════════════════════════════════════

  // — 경제/금융 전문
  // — Economy/finance specialized feeds
  { name: "CNBC Economy", url: "https://www.cnbc.com/id/15839135/device/rss/rss.html", category: "international" },
  { name: "CNBC Finance", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html", category: "international" },
  { name: "CNBC World", url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", category: "international" },
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "international" },
  { name: "MarketWatch", url: "http://feeds.marketwatch.com/marketwatch/topstories/", category: "international" },
  { name: "WSJ Markets", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", category: "international" },
  { name: "WSJ World", url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", category: "international", broad: true },
  { name: "NYT Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", category: "international" },
  { name: "NYT Economy", url: "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml", category: "international" },
  { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml", category: "international" },
  { name: "Guardian Business", url: "https://www.theguardian.com/uk/business/rss", category: "international" },
  { name: "Reuters Business", url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best", category: "international" },
  { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", category: "international" },
  { name: "FT", url: "https://www.ft.com/rss/home", category: "international", broad: true },
  { name: "Economist", url: "https://www.economist.com/finance-and-economics/rss.xml", category: "international" },
  // — 범용 (키워드 필터)
  // — General feeds (keyword filter)
  { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml", category: "international", broad: true },
  { name: "BBC Middle East", url: "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml", category: "international", broad: true },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "international", broad: true },
  { name: "Al Jazeera Middle East", url: "https://www.aljazeera.com/xml/rss/all.xml?tag=middleeast", category: "international", broad: true },
  { name: "AP News", url: "https://rsshub.app/apnews/topics/business", category: "international" },
  { name: "AP News World", url: "https://rsshub.app/apnews/topics/world-news", category: "international", broad: true },
  { name: "Reuters World", url: "https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best", category: "international", broad: true },
  { name: "CNN World", url: "http://rss.cnn.com/rss/edition_world.rss", category: "international", broad: true },
  { name: "CNN Middle East", url: "http://rss.cnn.com/rss/edition_meast.rss", category: "international", broad: true },
  { name: "NYT World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "international", broad: true },
  { name: "NYT Middle East", url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", category: "international", broad: true },
  { name: "Google 세계경제", url: "https://news.google.com/rss/search?q=global+economy+trade+tariff&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google 연준", url: "https://news.google.com/rss/search?q=Federal+Reserve+interest+rate&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google 유가", url: "https://news.google.com/rss/search?q=oil+price+OPEC+energy&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  // — 이란전쟁/중동 속보 (Google News RSS)
  // — Iran war / Middle East breaking news feeds
  { name: "Google 이란전쟁", url: "https://news.google.com/rss/search?q=이란+전쟁+중동+미사일+공습&hl=ko&gl=KR&ceid=KR:ko", category: "international", broad: true },
  { name: "Google Iran War", url: "https://news.google.com/rss/search?q=Iran+war+missile+strike+Middle+East&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google 중동분쟁", url: "https://news.google.com/rss/search?q=중동+분쟁+이스라엘+이란+전쟁&hl=ko&gl=KR&ceid=KR:ko", category: "international", broad: true },

  // — 해외 증권 전문
  // — International stocks specialized feeds
  { name: "Investing.com", url: "https://www.investing.com/rss/news.rss", category: "international" },
  { name: "Seeking Alpha", url: "https://seekingalpha.com/market_currents.xml", category: "international" },
  { name: "Motley Fool", url: "https://www.fool.com/feeds/index.aspx", category: "international" },
  { name: "Benzinga", url: "https://www.benzinga.com/feed", category: "international" },
  // — 해외 증권 Google 검색
  // — International stocks Google search
  { name: "Google S&P500", url: "https://news.google.com/rss/search?q=S%26P500+nasdaq+dow+jones+stock&hl=en&gl=US&ceid=US:en", category: "international", broad: true },

  // — 해외 추가 피드
  // — Additional international feeds
  { name: "CNBC Tech", url: "https://www.cnbc.com/id/19854910/device/rss/rss.html", category: "international" },
  { name: "Google Treasury", url: "https://news.google.com/rss/search?q=treasury+yield+bond+market&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google Commodities", url: "https://news.google.com/rss/search?q=gold+silver+copper+commodities+price&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google ECB BOJ", url: "https://news.google.com/rss/search?q=ECB+BOJ+central+bank+interest+rate&hl=en&gl=US&ceid=US:en", category: "international", broad: true },
  { name: "Google China Economy", url: "https://news.google.com/rss/search?q=China+economy+trade+yuan+tariff&hl=en&gl=US&ceid=US:en", category: "international", broad: true },

  // ══════════════════════════════════════
  // 코인뉴스 (crypto)
  // ══════════════════════════════════════

  // — 코인 전문 매체
  // — Crypto specialized media
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml", category: "crypto" },
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss", category: "crypto" },
  { name: "CryptoSlate", url: "https://cryptoslate.com/feed/", category: "crypto" },
  { name: "Decrypt", url: "https://decrypt.co/feed", category: "crypto" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml", category: "crypto" },
  { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/", category: "crypto" },
  { name: "CryptoNews", url: "https://cryptonews.com/news/feed/", category: "crypto" },
  { name: "BeInCrypto", url: "https://beincrypto.com/feed/", category: "crypto" },
  { name: "NewsBTC", url: "https://www.newsbtc.com/feed/", category: "crypto" },
  { name: "U.Today", url: "https://u.today/rss", category: "crypto" },
  { name: "AMBCrypto", url: "https://ambcrypto.com/feed/", category: "crypto" },
  { name: "DailyHodl", url: "https://dailyhodl.com/feed/", category: "crypto" },
  { name: "Blockonomi", url: "https://blockonomi.com/feed/", category: "crypto" },
  { name: "CryptoPotato", url: "https://cryptopotato.com/feed/", category: "crypto" },
  { name: "Bitcoinist", url: "https://bitcoinist.com/feed/", category: "crypto" },
  // — 국내 코인
  // — Korean crypto media
  { name: "블록미디어", url: "https://www.blockmedia.co.kr/feed/", category: "crypto" },
  { name: "코인니스", url: "https://coinness.com/rss", category: "crypto" },
  // — Google 검색
  // — Google search feeds
  { name: "Google 비트코인", url: "https://news.google.com/rss/search?q=비트코인+이더리움+암호화폐&hl=ko&gl=KR&ceid=KR:ko", category: "crypto", broad: true },
  { name: "Google Crypto", url: "https://news.google.com/rss/search?q=bitcoin+ethereum+crypto+market&hl=en&gl=US&ceid=US:en", category: "crypto", broad: true },
  { name: "Google 업비트", url: "https://news.google.com/rss/search?q=업비트+빗썸+코인+거래소&hl=ko&gl=KR&ceid=KR:ko", category: "crypto", broad: true },

  // — 코인 추가 피드
  // — Additional crypto feeds
  { name: "코인데스크코리아", url: "https://www.coindeskkorea.com/feed/", category: "crypto" },
  { name: "Google DeFi", url: "https://news.google.com/rss/search?q=DeFi+decentralized+finance+yield&hl=en&gl=US&ceid=US:en", category: "crypto", broad: true },
  { name: "Google 코인규제", url: "https://news.google.com/rss/search?q=암호화폐+규제+법안+가상자산&hl=ko&gl=KR&ceid=KR:ko", category: "crypto", broad: true },
];
