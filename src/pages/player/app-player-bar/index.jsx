import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slider, message } from 'antd';

import style from './style.module.scss';
import {
  getChangeCurrentSongIndexAction,
  getChangeCurrentSongLyricsAction,
} from '../store/actionCreators';
import { getPlayerSongUrl, formatDate } from '@/utils/format-utils';
import WYAppPlayerPanel from '../app-player-panel';

export default function WYAppPlayerBar() {
  const dispatch = useDispatch();
  const { currentSongIndex, currentSongLyrics, playMusicsList } = useSelector(
    (state) => ({
      currentSongIndex: state.getIn(['player', 'currentSongIndex']),
      currentSongLyrics: state.getIn(['player', 'currentSongLyrics']),
      playMusicsList: state.getIn(['player', 'playMusicsList']),
    }),
  );

  const currentSong = playMusicsList[currentSongIndex];

  const audioRef = useRef();
  const sliderRef = useRef();
  const [currentTime, setCurrentTime] = useState(0);
  const [isHandleChangeFlag, setIsHandleChangeFlag] = useState(false);
  const [isPlayingFlag, setIsPlayingFlag] = useState(false);
  const [isShowPanel, setIsShowPanel] = useState(false); // 歌曲列表面板显示
  const [playSequence, setPlaySequence] = useState(0); // 歌曲播放顺序
  const [isPlayEnd, setIsPlayEnd] = useState(false);
  useEffect(() => {
    console.log('currentSong 改变了。。。');
    setIsPlayEnd(false);
    if (currentSong?.id) {
      audioRef.current.src = getPlayerSongUrl(currentSong?.id);
      dispatch(getChangeCurrentSongLyricsAction(currentSong?.id));
    }
    isPlayingFlag && audioRef.current.play();
  }, [currentSong]);
  useEffect(() => {
    console.log(playSequence, 'isplayend');
    if (isPlayEnd) {
      setIsPlayingFlag(true);
      switch (playSequence) {
        case 0:
          playMusic();
          break;
        case 1:
          changeCurrentSongIndex(1);
          break;
        case 2:
          var randomIndex = Math.floor(Math.random() * playMusicsList.length);
          while (randomIndex === currentSongIndex) {
            randomIndex = Math.floor(Math.random() * playMusicsList.length);
          }
          console.log(randomIndex);
          dispatch(getChangeCurrentSongIndexAction(randomIndex));
          break;
        default:
      }
    }
  }, [isPlayEnd, playSequence]);

  const singerName = (currentSong?.ar && currentSong.ar[0].name) || '未知歌手';
  const durationTime = currentSong?.dt || 0;
  const fmtDuration = formatDate(durationTime, 'mm:ss');
  const fmtCurrentTime = formatDate(currentTime, 'mm:ss');
  const playMusic = useCallback(() => {
    console.log('播放歌曲', isPlayingFlag);
    setIsPlayEnd(false);
    !isPlayingFlag
      ? audioRef.current.play().catch(() => setIsPlayingFlag(false))
      : audioRef.current.pause();
    setIsPlayingFlag(!isPlayingFlag);
  }, [isPlayingFlag, isPlayEnd]);
  const handleTimeUpdate = (e) => {
    debugger;
    console.log('歌曲在播放，时间更新', isHandleChangeFlag);
    const audioCurrentTime = e.target.currentTime * 1000; // 毫秒
    // console.log(audioCurrentTime);
    !isHandleChangeFlag && setCurrentTime(audioCurrentTime);
    // fmtDuration === fmtCurrentTime && setIsPlayingFlag(false);
    // console.log(fmtCurrentTime);

    // 歌词显示
    // console.log(currentSongLyrics);
    const currentLyricIndex =
      currentSongLyrics.findIndex((item) => audioCurrentTime < item.time) - 1;
    // console.log(currentLyricIndex);
    currentSongLyrics[currentLyricIndex]?.content &&
      message.open({
        key: 'lyric',
        className: 'lyric-message',
        duration: 0,
        content: currentSongLyrics[currentLyricIndex]?.content,
      });
  };
  const handleMusicEnded = () => {
    console.log('播放结束了');
    debugger;
    setIsHandleChangeFlag(false);
    setIsPlayingFlag(false);
    setIsPlayEnd(true);
  };
  const handleSliderChange = useCallback(
    (value) => {
      debugger;
      console.log(
        '滑块改变了------------------------------------------------>>',
        value,
      );
      !isPlayEnd && setIsHandleChangeFlag(true);
      // console.log('slider', value);
      setCurrentTime(value);
    },
    [isPlayEnd],
  );
  const handleSliderAfterChange = useCallback(
    (value) => {
      console.log('滑块停止了');
      sliderRef.current.blur();
      setIsHandleChangeFlag(false);
      // console.log(value / 1000);
      audioRef.current.currentTime = value / 1000;
      setCurrentTime(value);
      // console.log('after', value);
      !isPlayingFlag && playMusic();
    },
    [isPlayingFlag, playMusic],
  );
  // 改变当前播放歌曲索引 上一首 下一首
  const changeCurrentSongIndex = (step) => {
    setIsPlayEnd(false);
    let index = currentSongIndex + step;
    // console.log(index);
    // console.log(playMusicsList.length, 'length');
    if (index < 0) index = 0;
    if (index > playMusicsList.length - 1) index = playMusicsList.length - 1;
    console.log(index);
    console.log(currentSongIndex);
    index !== currentSongIndex &&
      dispatch(getChangeCurrentSongIndexAction(index));
  };

  // 循环播放 顺序播放 随机播放
  const changePlaySequence = () => {
    setPlaySequence(playSequence + 1);
    playSequence === 2 && setPlaySequence(0);
    console.log(playSequence);
  };
  console.log('页面刷新。。。', currentTime);
  return (
    <div className={`${style['wy-app-player-bar']} sprite-player`}>
      <div className={`${style['content']} wrap-v2`}>
        <div className={style['control']}>
          <button
            className={`${style['prev']} sprite-player`}
            onClick={() => changeCurrentSongIndex(-1)}
          ></button>
          <button
            className={`${style['play']} sprite-player`}
            style={{
              backgroundPosition: `0 ${isPlayingFlag ? '-165px' : '-204px'}`,
            }}
            onClick={playMusic}
          ></button>
          <button
            className={`${style['next']} sprite-player`}
            onClick={() => changeCurrentSongIndex(1)}
          ></button>
        </div>
        <div className={style['play-info']}>
          <div className={style['image']}>
            <a href="">
              <img src={currentSong?.al?.picUrl} alt="" />
            </a>
          </div>
          <div className={style['info']}>
            <div className={style['song']}>
              <span className={style['song-name']}>{currentSong?.name}</span>
              <a href="" className={style['singer-name']}>
                {singerName}
              </a>
            </div>
            <div className={style['progress']}>
              <Slider
                ref={sliderRef}
                min={0}
                max={durationTime}
                defaultValue={0}
                value={currentTime}
                tipFormatter={() => fmtCurrentTime}
                onChange={handleSliderChange}
                onAfterChange={handleSliderAfterChange}
              />
              <div className={style['time']}>
                <span>{fmtCurrentTime}</span>
                <span>{'/'}</span>
                <span>{fmtDuration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={style['operator']}>
          <div className={style['left']}>
            <button
              className={`${style['btn']} ${style['favor']} sprite-player`}
            ></button>
            <button
              className={`${style['btn']} ${style['share']} sprite-player`}
            ></button>
          </div>
          <div className={style['right']}>
            <button
              className={`${style['btn']} ${style['volume']} sprite-player`}
            ></button>
            <button
              className={`${style['btn']} ${
                playSequence === 0 ? style['loop-loop'] : ''
              }${playSequence === 1 ? style['loop-order'] : ''}${
                playSequence === 2 ? style['loop-random'] : ''
              } sprite-player`}
              onClick={changePlaySequence}
            ></button>
            <button
              className={`${style['btn']} ${style['playlist']} sprite-player`}
              onClick={() => setIsShowPanel(!isShowPanel)}
            >
              {playMusicsList.length}
            </button>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => handleTimeUpdate(e)}
        onEnded={handleMusicEnded}
      />
      {isShowPanel && <WYAppPlayerPanel />}
    </div>
  );
}
