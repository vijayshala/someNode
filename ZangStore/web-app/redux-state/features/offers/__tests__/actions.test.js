// import configureMockStore from 'redux-mock-store';
// import { normalize } from 'normalizr';
// import thunk from 'redux-thunk';
// import api from '../../../middleware/api';

// import * as actions from '../actions';
// import * as types from '../actionTypes';
// import schema from '../schema';
// import fetchMock from 'fetch-mock';
// // import expect from 'expect';

// const mockStore = configureMockStore([thunk, api]);

// const topicData = {
//   data: [
//     {
//       _id: '5a327b7b39e73e0ae8e8864d',
//       title: 'Mera Mpaas Space',
//       description: '',
//       status: 0,
//       members: [
//         {
//           member: '59e8eba49cec569d89a75234',
//           memberType: 'userId',
//           role: 'admin',
//           joinTime: '2017-12-14T13:24:11.215Z',
//           username: 'rayg@esna.com',
//           displayname: 'Ray Gerami K',
//           picture_url:
//             'https://lh6.googleusercontent.com/-Hv1qTBrUUBI/AAAAAAAAAAI/AAAAAAAAAD0/ocKelr07smI/photo.jpg',
//           phone_numbers: []
//         },
//         {
//           displayname: 'Wesley1 Frederickson',
//           username: 'wesleyf@esna.com',
//           joinTime: '2017-12-14T14:01:23.229Z',
//           role: 'admin',
//           memberType: 'userId',
//           member: '59398a113bab0e18ff057538',
//           phone_numbers: []
//         }
//       ],
//       settings: { mdSrv: 'ams' },
//       created: '2017-12-14T13:24:11.215Z',
//       type: 'group',
//       modified: '2017-12-22T16:34:31.223Z',
//       isPinned: null,
//       notification: null,
//       role: 'guest',
//       lastAccess: '2017-12-22T16:34:31.223Z'
//     },
//     {
//       _id: '5a2145014e144e28f1547b3e',
//       title: 'space',
//       description: '',
//       status: 0,
//       members: [
//         {
//           member: '5a2113f99cec569d8932c89d',
//           memberType: 'userId',
//           role: 'admin',
//           joinTime: '2017-12-01T12:03:13.704Z',
//           username: 'ibrikin@mera.ru',
//           displayname: 'Igor Brikin',
//           picture_url: '',
//           phone_numbers: []
//         }
//       ],
//       settings: { confId: '131624476', mdOpts: [], mdSrv: 'ams' },
//       created: '2017-12-01T12:03:13.704Z',
//       type: 'group',
//       isPinned: null,
//       notification: null,
//       role: 'admin',
//       lastAccess: '2017-12-22T13:20:03.374Z'
//     }
//   ],
//   from: 0,
//   to: 1
// };

// describe('test actions', () => {
//   afterEach(() => {
//     fetchMock.reset();
//     fetchMock.restore();
//   });

//   it('test n1', () => {
//     fetchMock.getOnce('*', {
//       body: topicData,
//       headers: { 'content-type': 'application/json' }
//     });
//     const expectedActions = [
//       { type: types.FETCH_GROUP_TOPICS },
//       {
//         type: types.FETCH_GROUP_TOPICS_SUCCESS,
//         payload: normalize(topicData, schema.MY_TOPIC)
//       }
//     ];
//     const store = mockStore({ ...normalize(topicData, schema.MY_TOPIC) });

//     return store.dispatch(actions.fetchGroupTopics()).then(() => {
//       // return of async actions

//       console.log(store.getActions());

//       console.log(store.getState());
//     });
//   });
// });
