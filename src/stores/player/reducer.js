import { Map } from 'immutable';

import * as actionTypes from './constants';

const defaultState = Map({
  playMusicsList: [],
  currentSongIndex: 0, // 当前歌曲的列表索引
  currentSong: {}, // 当前播放歌曲
  currentSongLyrics: [], // 当前播放歌曲歌词
  playSequence: actionTypes.SEQUENCE_ORDER, // 0 顺序 1 循环 2 随机
});

function reducer(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.CHANGE_PLAY_MUSIC_LIST:
      return state.set('playMusicsList', action.playMusicsList);
    case actionTypes.CHANGE_CURRENT_SONG_INDEX:
      return state.set('currentSongIndex', action.currentSongIndex);
    case actionTypes.CHANGE_CURRENT_SONG:
      return state.set('currentSong', action.currentSong);
    case actionTypes.CHANGE_CURRENT_SONG_LYRICS:
      return state.set('currentSongLyrics', action.lyrics);
    case actionTypes.CHANGE_PLAY_SEQUENCE:
      return state.set('playSequence', action.sequence);
    default:
      return state;
  }
}

export default reducer;
