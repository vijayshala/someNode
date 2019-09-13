const logger = require('applogger');

const { ProductBackend } = require('../../product/product.backend');

const initProducts = async(options) => {
  const fn = `[initProducts]`;
  const collection = 'product';
  options = Object.assign({
    emptyCollection: false,
  }, options);

  let docs;

  if (options.emptyCollection) {
    logger.info(fn, `empty ${collection}s collection...`);
    await ProductBackend.remove();
  }
  docs = [{
    type: 'simple',
    status: 'published',
    identifier: 'kazoo',
    title: {
      text: 'KAZOO',
    },
    engines: ['kazoo'],
    attributes: [],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'ip-office',
    title: {
      text: 'IPOffice',
    },
    engines: ['ip-office'],
    attributes: [],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'zang-spaces',
    title: {
      text: 'Avaya Spaces',
    },
    engines: ['zang-spaces'],
    attributes: [{
      identifier: 'spaces_creation_and_management',
      title: { text: 'Space Creation and Management' },
    }, {
      identifier: 'sso',
      title: { text: 'Single Sign On (Zang Identity)' },
    }, {
      identifier: 'admin',
      title: { text: 'Administrative Management' },
    }, {
      identifier: 'online_support',
      title: { text: 'Online Support' },
    }, {
      identifier: 'live_support',
      title: { text: 'Live Support' },
    }, {
      identifier: 'web_application_access',
      title: { text: 'Web Application Access' },
    }, {
      identifier: 'mobile_application_access',
      title: { text: 'Mobile Application Access' },
      description: { text: 'Available for Android and Apple IOS mobile devices' },
    }, {
      identifier: 'room_messaging',
      title: { text: 'Room Messaging' },
    }, {
      identifier: 'direct_messaging',
      title: { text: 'Direct Messaging' },
    }, {
      identifier: 'file_sharing',
      title: { text: 'File Sharing**' },
    }, {
      identifier: 'shared_file_previews',
      title: { text: 'Shared File Previews**' },
    }, {
      identifier: 'group_task_management',
      title: { text: 'Group Task Management' },
    }, {
      identifier: 'online_voice_conferemce',
      title: { text: 'Online Voice Conference' },
    }, {
      identifier: 'direct_online_video_calling',
      title: { text: 'Direct Online Video Calling' },
      description: { text: '1-on-1 video calling with other Avaya Spaces users' },
    }, {
      identifier: 'online_video_conference',
      title: { text: 'Online Video Conference' },
      description: { text: '1-on-1 video calling with other Avaya Spaces users' },
    }, {
      identifier: 'dial_in_capabilities_for_online_conferences',
      title: { text: 'Dial-in Capabilities for Online Conferences' },
      description: { text: 'Phone number provided for participants to join Online Conference' },
    }, {
      identifier: 'application_integrations',
      title: { text: 'Application Integrations' },
      description: { text: '(Avaya Agenda, Outlook Plug-in, Google Calendar extension & more)' },
    }, {
      identifier: 'api',
      title: { text: 'Application Programming Interface (API)' },
    }, {
      identifier: 'api_support',
      title: { text: 'API Support' },
    }],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avaya-vantage-v1-0',
    title: {
      text: 'Avaya Vantage',
    },
    description: {
      text: 'TheEngage using an innovative, all-glass, dedicated desktop device. Use voice, chat, and collaboration apps through one-touch connections. There are no unnatural breaks or pauses. And no need to manage multiple devices for engagement. Mesh unique custom experiences into your workflows and business processes. This powerful, customizable device gives you the advantages of a deskphone and the flexibility of an application platform.',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/zangstore.appspot.com/public_files/desktopVantageHardphone_wCord.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/zangstore.appspot.com/public_files/desktopVantageHardphone_wCord.png',
    }],
    attributes: [],
    tags: ['zang-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'ipoapplication',
    title: {
      text: 'Avaya Cloud Solutions Softphone',
      resource: 'IP_OFFICE_PHONE_APPLICATION',
    },
    description: {
      text: 'The Avaya Cloud Solutions softphone provides users with simple access to all the communication channels in a single interface. Avaya Cloud Solutions softphone enables you to log into your Avaya Cloud Solutions and make and receive voice and video calls from your deskphone extension using your PC. Softphone is included for free with Avaya Cloud Solutions Standard and Power user subscriptions.',
      resource: 'IP_OFFICE_PHONE_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya_IPO_app_icon.svg',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya_IPO_app_icon.svg',
    }],
    attributes: [{
      identifier: 'model',
      value: 'ipoapplication',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avayaj129',
    title: {
      text: 'Avaya J129 IP Deskphone',
      resource: 'AVAYA_J129_LABEL',
    },
    description: {
      text: 'Get all your essential call-handling features in an affordable, yet highly functional SIP Phone. This phone delivers the key features needed by users in any-size businesses. The phone supports two call appearances with single-line call display. Buy a phone with solid features that trumps what’s available in the market today.',
      resource: 'AVAYA_J129_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J129.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J129.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'j129',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  },
  {
    type: 'simple',
    status: 'published',
    identifier: 'avayaj139',
    title: {
      text: 'Avaya J139 IP Deskphone',
      resource: 'AVAYA_J139_LABEL',
    },
    description: {
      text: 'Get all your essential call-handling features in an affordable, yet highly functional SIP Phone. This phone delivers the key features needed by users in any-size businesses. The phone supports two call appearances with single-line call display. Buy a phone with solid features that trumps what’s available in the market today.',
      resource: 'AVAYA_J139_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J139.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-J139.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'j139',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  },
  {
    type: 'simple',
    status: 'published',
    identifier: 'avaya9608g',
    title: {
      text: 'Avaya 9608G IP Deskphone',
      resource: 'AVAYA_9608G_LABEL',
    },
    description: {
      text: 'The 9608G deskphone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_9608G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9608g.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9608g.png',
    }],
    attributes: [{
      identifier: 'model',
      value: '9608g',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avaya9611g',
    title: {
      text: 'Avaya 9611G IP Deskphone',
      resource: 'AVAYA_9611G_LABEL',
    },
    description: {
      text: 'The 9611G model includes integrated gigabit and a USB interface. It has a 3.5 inch graphical color display with a white backlight and graphical labels that can be administered centrally. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance.',
      resource: 'AVAYA_9611G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9611G.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9611G.png',
    }],
    attributes: [{
      identifier: 'model',
      value: '9611g',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  },{
    type: 'simple',
    status: 'published',
    identifier: 'avaya9641g',
    title: {
      text: 'Avaya 9641GS IP Deskphone',
      resource: 'AVAYA_9641G_LABEL',
    },
    description: {
      text: 'The Avaya 9641GS is a multi-line premium deskphone ideally suited for people who spend considerable amounts of time on the phone and who rely on intelligent communications and productivity enhancing capabilities. The 9641GS has a 5.0 inch color graphical display, larger touch screen and high definition audio quality. Its wideband audio codec provides exceptional audio performance on all audio interfaces including handset, headset and speaker phone.',
      resource: 'AVAYA_9641G_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9641gs.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-9641gs.png',
    }],
    attributes: [{
      identifier: 'model',
      value: '9641gs',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avayaj169',
    title: {
      text: 'Avaya J169 Phone',
      resource: 'AVAYA_J169_LABEL',
    },
    description: {
      text: 'The Avaya J169 deskphone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_J169_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j169.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j169.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'j169',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avayaj179',
    title: {
      text: 'Avaya J179 Phone',
      resource: 'AVAYA_J179_LABEL',
    },
    description: {
      text: 'The Avaya J179 deskphone is a cost-effective fully functional phone with support for integrated gigabit and monochrome display. Power over Ethernet simplifies deployment and its wideband audio codec provides exceptional audio performance. Designed for small to large enterprises, this deskphone includes access to eight lines and graphical labels that can be administered centrally.',
      resource: 'AVAYA_J179_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j179.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-j179.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'j179',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avayak175',
    title: {
      text: 'Avaya Vantage™ K175',
      resource: 'AVAYA_K175_LABEL',
    },
    description: {
      text: 'The Avaya K175 is a multi-line premium deskphone ideally suited for people who spend considerable amounts of time on the phone and who rely on intelligent communications and productivity enhancing capabilities. The 9641GS has a 5.0 inch color graphical display, larger touch screen and high definition audio quality. Its wideband audio codec provides exceptional audio performance on all audio interfaces including handset, headset and speaker phone.',
      resource: 'AVAYA_K175_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-k175.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/avaya-h175.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'k175',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }, {
    type: 'simple',
    status: 'published',
    identifier: 'avayab179',
    title: {
      text: 'Avaya B179 SIP Conference Phone',
      resource: 'AVAYA_PHONE_B179_LABEL',
    },
    description: {
      text: 'Tested by Tolly, this flexible SIP-based conference phone delivers clear, natural sound from OmniSound 2.0, Avaya’s patented wideband audio technology. The phone is packed with intelligent features for more efficient conference calls. Use the conference guide to call pre-programmed groups. Import and export contact details conveniently via the web interface. Create your own contact list with the personal user profile feature.',
      resource: 'AVAYA_PHONE_B179_DESCRIPTION',
    },
    images: [{
      identifier: 'default',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }, {
      identifier: 'grey',
      url: 'https://storage.googleapis.com/avayastore/public_files/B179.png',
    }],
    attributes: [{
      identifier: 'model',
      value: 'b179',
      isStatic: true,
    }],
    tags: ['ip-office-devices'],
    created: {
      by: null,
      on: new Date()
    },
  }];

  for (let doc of docs) {
    logger.info(fn, `creating "${doc.identifier}" ...`);
    let result = await ProductBackend.findOneAndUpdate({
      identifier: doc.identifier,
    }, doc, { upsert: true, returnNewDocument: true });
    logger.info(fn, `    "${doc.identifier}" created`, result);
  }
};

module.exports = initProducts;
