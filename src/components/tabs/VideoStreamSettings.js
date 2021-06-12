import React, { useState, useContext, useEffect } from "react";

import Flashphoner from "@flashphoner/websdk";
import Button from "antd/es/button";
import Modal from "antd/es/modal";
import Select from "antd/es/select";
import clsx from "clsx";
import { browser, isMobileDevice } from "detectrtc";
import { observer } from "mobx-react-lite";

import { DoneIcon } from "../../assets/icons/DoneIcon";
import CONFIG from "../../config";
import { PublishContext } from "../../providers/PublishProvider";
import { useRootStore } from "../../store";
import Spiner from "../../ui/Spiner/Spiner";
import { Device } from "../../utils/device";
import { ListInterfaceTemplates } from "../getListInterfaceTemplates";

const VideoStreamSettings = ({
  roomUid,
  roomSession,
  setRoomSession,
  session,
}) => {
  const { translation, publisherIndexAction } = useContext(PublishContext);
  const { translation: translationStore } = useRootStore();

  const [optionsAudio, setOptionsAudio] = useState([]);
  const [optionsVideo, setOptionsVideo] = useState([]);
  const [
    statePossibilityStartBroadcast,
    setStatePossibilityStartBroadcast,
  ] = useState(false);
  const [stateCapturePrimaryStream, setStateCapturePrimaryStream] = useState(
    false
  );
  const [
    stateCaptureSecondaryStream,
    setStateCaptureSecondaryStream,
  ] = useState(false);
  const [primaryStream, setPrimaryStream] = useState(null);
  const [secondaryStream, setSecondaryStream] = useState(null);
  const [primaryVideoSrc, setPrimaryVideoSrc] = useState({
    value: "",
    label: "Не выбрано",
  });
  const [primaryAudioSrc, setPrimaryAudioSrc] = useState({
    value: "mute",
    label: "Без звука",
  });
  const [secondaryVideoSrc, setSecondaryVideoSrc] = useState({
    value: "",
    label: "Не выбрано",
  });
  const [secondaryAudioSrc, setSecondaryAudioSrc] = useState({
    value: "mute",
    label: "Без звука",
  });
  const [roomInstance, setRoomInstance] = useState(false);

  const [
    stateLoaderBtnStartPrimaryBroadcast,
    setStateLoaderBtnStartPrimaryBroadcast,
  ] = useState(false);
  const [
    stateLoaderBtnStartSecondaryBroadcast,
    setStateLoaderBtnStartSecondaryBroadcast,
  ] = useState(false);
  const [
    statePrimaryPublisherBroadcast,
    setStatePrimaryPublisherBroadcast,
  ] = useState(false);
  const [
    messageFromAnotherPublisher,
    setMessageFromAnotherPublisher,
  ] = useState(null);
  const [leftFromAnotherPublisher, setLeftFromAnotherPublisher] = useState(
    null
  );

  const [primaryVideoStats, setPrimaryVideoStats] = useState({});
  const [secondaryVideoStats, setSecondaryVideoStats] = useState({});

  const { STREAM_STATUS } = Flashphoner.constants;
  const ROOM_EVENT = Flashphoner.roomApi.events;
  const _participants = 1000000;
  const optionsSelectedQtyVideo = [
    { value: 2, label: "2" },
    { value: 4, label: "4" },
    { value: 6, label: "6" },
  ];

  let listUsers;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function checkStatePossibilityStartBroadcast() {
    if (
      ((roomSession.interface.template === 1 ||
        roomSession.interface.template === 3) &&
        stateCapturePrimaryStream) ||
      ((roomSession.interface.template === 2 ||
        roomSession.interface.template === 4) &&
        stateCapturePrimaryStream &&
        stateCaptureSecondaryStream)
    ) {
      setStatePossibilityStartBroadcast(true);
    } else {
      setStatePossibilityStartBroadcast(false);
    }
  }

  function getOptionsPrimaryStream() {
    console.log("FIRE!");
    const streamName = `${roomUid}:main:${translation.uid}`;
    const video = document.getElementById("primaryVideo");
    const constraints = {
      video: {},
      cacheLocalResources: true,
      receiveVideo: false,
      receiveAudio: false,
      //audio: false,
    };

    const mediaConnectionConstraints = {
      mandatory: {
        googCpuOveruseDetection: false,
      },
    };

    if (primaryVideoSrc.value === "screen") {
      constraints.video = {
        type: "screen",
        width: window.screen.width > 1920 ? 1920 : window.screen.width,
        height: window.screen.height > 1080 ? 1080 : window.screen.height,
        frameRate: 30,
        withoutExtension: true,
      };
    } else {
      constraints.video = {
        deviceId: primaryVideoSrc.value,
        width: 1280,
        height: 720,
        // width: !isChrome ? 1280 : window.screen.width,
        // height: !isChrome ? 720 : window.screen.height,
        frameRate: 30,
      };
    }

    if (primaryAudioSrc.value && primaryAudioSrc.value !== "mute") {
      constraints.audio = {
        deviceId: primaryAudioSrc.value,
      };
    }

    return {
      record: false,
      name: streamName,
      display: video,
      remoteVideo: video.contentElement,
      constraints: constraints,
      mediaConnectionConstraints: mediaConnectionConstraints,
      disableConstraintsNormalization: Device.isSafariMacOS(),
    };
  }

  function stopCapturePrimaryStream() {
    setStateCapturePrimaryStream(false);
    setStateLoaderBtnStartPrimaryBroadcast(false);
    setPrimaryVideoStats({});
    if (primaryStream) {
      primaryStream.stop();
    }
    setRoomSession((prevState) => ({
      ...prevState,
      streams: {
        init: prevState.streams.init,
        broadcasting: prevState.streams.broadcasting,
        main: {
          input: "",
          output: "",
        },
        advanced: {
          input: "",
          output: "",
          // fio: prevState.streams.advanced.fio,
        },
      },
    }));
  }

  function stopCaptureSecondaryStream() {
    setStateCaptureSecondaryStream(false);
    setStateLoaderBtnStartSecondaryBroadcast(false);
    setSecondaryVideoStats({});
    if (secondaryStream) {
      secondaryStream.stop();
    }
    setRoomSession((prevState) => ({
      ...prevState,
      streams: {
        init: prevState.streams.init,
        broadcasting: prevState.streams.broadcasting,
        main: {
          input: prevState.streams.main.input,
          output: prevState.streams.main.output,
        },
        advanced: {
          input: "",
          output: "",
          // fio: prevState.streams.advanced.fio,
        },
      },
    }));
  }

  // functions update state roomSession
  function setStateBroadcasting(stateBroadcasting) {
    setRoomSession((prevState) => ({
      ...prevState,
      streams: {
        init: prevState.streams.init,
        broadcasting: stateBroadcasting,
        main: {
          input: prevState.streams.main.input,
          output: prevState.streams.main.output,
        },
        advanced: {
          input: prevState.streams.advanced.input,
          output: prevState.streams.advanced.output,
        },
      },
    }));
  }

  function resetStateSrcStreams() {
    setPrimaryVideoSrc({ value: "", label: "Не выбрано" });
    setPrimaryAudioSrc({ value: "mute", label: "Без звука" });
    setSecondaryVideoSrc({ value: "", label: "Не выбрано" });
    setSecondaryAudioSrc({ value: "mute", label: "Без звука" });
  }

  function hidePrimaryPublishInfo() {
    Array.from(document.getElementsByClassName("streamPublishInfo")).map(
      (element) => {
        element.style.display = "none";
      }
    );
  }

  function hideAdvancedPublishInfo() {
    document.getElementById("streamAdvancedPublishInfo").style.display = "none";
  }

  function startCapturePrimaryStream() {
    setStateLoaderBtnStartPrimaryBroadcast(true);

    const optionsPrimaryStream = getOptionsPrimaryStream();
    session
      .createStream(optionsPrimaryStream)
      .on(STREAM_STATUS.PUBLISHING, (stream) => {
        console.log("STREAM_STATUS.PUBLISHING");

        console.log("optionsPrimaryStream: ", optionsPrimaryStream);

        Array.from(document.getElementsByClassName("streamPublishInfo")).map(
          (element) => {
            element.style.display = "flex";
            element.style.zIndex = 0;
          }
        );

        //вывод натсроек публикации видео
        setInterval(() => {
          stream.getStats(function (stats) {
            if (stats && stats.outboundStream) {
              if (stats.outboundStream.video) {
                setPrimaryVideoStats(stats.outboundStream.video);
              }
            }
          });
        }, 2000);

        setPrimaryStream(stream);
        setStateCapturePrimaryStream(true);
        setStateLoaderBtnStartPrimaryBroadcast(false);
        setRoomSession((prevState) => ({
          ...prevState,
          streams: {
            init: prevState.streams.init,
            broadcasting: prevState.streams.broadcasting,
            main: {
              input: primaryAudioSrc.value,
              output: optionsPrimaryStream.name,
              width: optionsPrimaryStream.constraints.video.width,
              height: optionsPrimaryStream.constraints.video.height,
              type: optionsPrimaryStream.constraints.video.type,
            },
            advanced: {
              input: prevState.streams.advanced.input,
              output: prevState.streams.advanced.output,
            },
          },
        }));
        // @ts-expect-error
        document
          .getElementById(stream.id())
          .srcObject.getVideoTracks()[0].onended = () => {
          stopCapturePrimaryStream();
          stream.stop();
          setStateBroadcasting(false);
        };
      })
      .on(STREAM_STATUS.UNPUBLISHED, (stream) => {
        console.log("STREAM_STATUS.UNPUBLISHED");

        Array.from(document.getElementsByClassName("streamPublishInfo")).map(
          (element) => {
            element.style.zIndex = 2;
          }
        );

        setPrimaryStream(null);
      })
      .on(STREAM_STATUS.FAILED, (stream) => {
        checkStatePossibilityStartBroadcast();
        setStateLoaderBtnStartPrimaryBroadcast(false);
      })
      .on(STREAM_STATUS.NEW, () => {
        console.log("STREAM_STATUS.NEW");
      })
      .on(STREAM_STATUS.PENDING, () => {
        console.log("STREAM_STATUS.PENDING");
      })
      .on(STREAM_STATUS.PLAYING, () => {
        console.log("STREAM_STATUS.PLAYING");
      })
      .on(STREAM_STATUS.PAUSED, () => {
        console.log("STREAM_STATUS.PAUSED");
      })
      .on(STREAM_STATUS.PLAYBACK_PROBLEM, () => {
        console.log("STREAM_STATUS.PLAYBACK_PROBLEM");
      })
      .on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, () => {
        console.log("STREAM_STATUS.NOT_ENOUGH_BANDWIDTH");
      })
      .on(STREAM_STATUS.RESIZE, () => {
        console.log("STREAM_STATUS.RESIZE");
      })
      .on(STREAM_STATUS.SNAPSHOT_COMPLETE, () => {
        console.log("STREAM_STATUS.SNAPSHOT_COMPLETE");
      })
      .on(STREAM_STATUS.STOPPED, () => {
        console.log("STREAM_STATUS.STOPPED");
      })
      .publish();
  }

  function getOptionsSecondaryStream() {
    const streamName = `${roomUid}:advanced:${translation.uid}`;
    const constraints = {
      video: {},
      audio: false,
      cacheLocalResources: true,
      receiveVideo: false,
      receiveAudio: false,
    };

    const mediaConnectionConstraints = {
      mandatory: {
        googCpuOveruseDetection: false,
      },
    };

    if (secondaryVideoSrc.value === "screen") {
      constraints.video = {
        type: "screen",
        width: window.screen.width > 1920 ? 1920 : window.screen.width,
        height: window.screen.height > 1080 ? 1080 : window.screen.height,
        frameRate: 30,
        withoutExtension: true,
      };
    } else {
      constraints.video = {
        deviceId: secondaryVideoSrc.value,
        width: 1280,
        height: 720,
        // width: !isChrome ? 1280 : window.screen.width,
        // height: !isChrome ? 720 : window.screen.height,
        frameRate: 30,
      };
    }

    if (secondaryAudioSrc.value && secondaryAudioSrc.value !== "mute") {
      constraints.audio = {
        deviceId: secondaryAudioSrc.value,
      };
    }

    return {
      record: false,
      name: streamName,
      display: document.getElementById("secondaryVideo"),
      mediaConnectionConstraints: mediaConnectionConstraints,
      constraints: constraints,
    };
  }

  function startCaptureSecondaryStream() {
    setStateLoaderBtnStartSecondaryBroadcast(true);
    const optionsSecondaryStream = getOptionsSecondaryStream();
    session
      .createStream(optionsSecondaryStream)
      .on(STREAM_STATUS.PUBLISHING, (stream) => {
        console.log("STREAM_STATUS.PUBLISHING");

        document.getElementById("streamAdvancedPublishInfo").style.display =
          "flex";
        document.getElementById("streamAdvancedPublishInfo").style.zIndex = 0;

        console.log("optionsSecondaryStream: ", optionsSecondaryStream);
        //вывод натсроек публикации видео
        setInterval(() => {
          stream.getStats(function (stats) {
            if (stats && stats.outboundStream) {
              if (stats.outboundStream.video) {
                setSecondaryVideoStats(stats.outboundStream.video);
              }
            }
          });
        }, 2000);

        setSecondaryStream(stream);
        setStateCaptureSecondaryStream(true);
        setStateLoaderBtnStartSecondaryBroadcast(false);
        setRoomSession((prevState) => ({
          ...prevState,
          streams: {
            init: prevState.streams.init,
            broadcasting: prevState.streams.broadcasting,
            main: {
              input: prevState.streams.main.input,
              output: prevState.streams.main.output,
            },
            advanced: {
              input: prevState.streams.advanced.input,
              output: optionsSecondaryStream.name,
              width: optionsSecondaryStream.constraints.video.width,
              height: optionsSecondaryStream.constraints.video.height,
              // fio: prevState.streams.advanced.fio,
            },
          },
        }));

        document
          .getElementById(stream.id())
          .srcObject.getVideoTracks()[0].onended = () => {
          stopCaptureSecondaryStream();
          stream.stop();
          setStateBroadcasting(false);
        };
      })
      .on(STREAM_STATUS.UNPUBLISHED, (stream) => {
        console.log("STREAM_STATUS.UNPUBLISHED");
        document.getElementById("streamAdvancedPublishInfo").style.zIndex = 2;
        setSecondaryStream(null);
      })
      .on(STREAM_STATUS.FAILED, (stream) => {
        checkStatePossibilityStartBroadcast();
        setStateLoaderBtnStartSecondaryBroadcast(false);
      })
      .on(STREAM_STATUS.NEW, () => {
        console.log("STREAM_STATUS.NEW");
      })
      .on(STREAM_STATUS.PENDING, () => {
        console.log("STREAM_STATUS.PENDING");
      })
      .on(STREAM_STATUS.PLAYING, () => {
        console.log("STREAM_STATUS.PLAYING");
      })
      .on(STREAM_STATUS.PAUSED, () => {
        console.log("STREAM_STATUS.PAUSED");
      })
      .on(STREAM_STATUS.PLAYBACK_PROBLEM, () => {
        console.log("STREAM_STATUS.PLAYBACK_PROBLEM");
      })
      .on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, () => {
        console.log("STREAM_STATUS.NOT_ENOUGH_BANDWIDTH");
      })
      .on(STREAM_STATUS.RESIZE, () => {
        console.log("STREAM_STATUS.RESIZE");
      })
      .on(STREAM_STATUS.SNAPSHOT_COMPLETE, () => {
        console.log("STREAM_STATUS.SNAPSHOT_COMPLETE");
      })
      .on(STREAM_STATUS.STOPPED, () => {
        console.log("STREAM_STATUS.STOPPED");
      })
      .publish();
  }

  useEffect(() => {
    if (roomSession.streams.init && roomSession.streams.broadcasting) {
      translationStore.start(roomUid, roomSession);
    }
  }, [roomSession.streams.init, roomSession.streams.broadcasting]);

  function startBroadcast() {
    setStateBroadcasting(true);
    setStreamsInit(true);
  }

  async function stopBroadcast() {
    await translationStore.stop(roomUid);
    setStateBroadcasting(false);
    stopCapturePrimaryStream();
    stopCaptureSecondaryStream();
    resetStateSrcStreams();
    hidePrimaryPublishInfo();
    roomSession.interface.template === 2 && hideAdvancedPublishInfo();
    publisherIndexAction(roomUid);
  }

  function setStreamsInit(state) {
    const primaryStream = getOptionsPrimaryStream();
    const secondaryStream = getOptionsSecondaryStream();

    setRoomSession((prevState) => {
      console.log(prevState.streams);
      return {
        ...prevState,
        streams: {
          init: state,
          broadcasting: prevState.streams.broadcasting,
          main: {
            input: prevState.streams.main.input,
            output: prevState.streams.main.output,
            width: primaryStream.constraints.video.width,
            height: primaryStream.constraints.video.height,
            type: primaryStream.constraints.video.type,
          },
          advanced: {
            input: prevState.streams.advanced.input,
            output: prevState.streams.advanced.output,
            width: secondaryStream.constraints.video.width,
            height: secondaryStream.constraints.video.height,
            // fio: prevState.streams.advanced.fio,
          },
        },
      };
    });
  }

  function setInterfaceTemplate(value) {
    if (isMobileDevice) {
      Modal.warning({
        title:
          "Для создания трансляции на два экрана необходимо использовать стационарный компьютер или ноутбук.",
      });
      return null;
    }
    setRoomSession((prevState) => ({
      ...prevState,
      interface: {
        template: parseInt(value, 10),
        title: prevState.interface.title,
        chat: prevState.interface.chat,
        smile: prevState.interface.smile,
        logos: prevState.interface.logos,
        buttons: prevState.interface.buttons,
        files: prevState.interface.files,
        opinions: prevState.interface.opinions,
      },
    }));
  }

  function joinRoom(roomConnection) {
    roomConnection
      .join({ name: roomUid })

      .on(ROOM_EVENT.STATE, (room) => {
        console.log("ROOM_EVENT.STATE");
        setRoomInstance(room);
        const participants = room.getParticipants();
        if (participants.length >= _participants) {
          console.warn(
            `Current room is full. Current number of participants in the room: ${participants.length}`
          );
          return false;
        }
        setRoomSession((prevState) => ({
          ...prevState,
          // stats: {
          //   countParticipants: participants.length,
          //   countChatMessages: prevState.stats.countChatMessages,
          // },
        }));
        setStreamsInit(true);
      })
      .on(ROOM_EVENT.JOINED, (participant) => {
        console.log("ROOM_EVENT.JOINED", participant.name(), participant);
        const user = parseUserName(participant.name());
        if (!user) {
          console.warn(
            "can`t parse username ",
            participant.name(),
            participant
          );
          return;
        }
        listUsers = roomSession.users;
        listUsers[user.id] = {
          joined: true,
          name: participant.name(),
        };
        setRoomSession((prevState) => ({
          ...prevState,
          // users: listUsers,
          // stats: {
          //   countParticipants: prevState.stats.countParticipants + 1,
          //   countChatMessages: prevState.stats.countChatMessages,
          // },
        }));
      })
      .on(ROOM_EVENT.LEFT, (participant) => {
        console.log("ROOM_EVENT.LEFT", participant.name(), participant);
        const user = parseUserName(participant.name());
        if (!user) {
          console.warn(
            "can`t parse username ",
            participant.name(),
            participant
          );
          return;
        }
        if (user.type === "p") {
          setLeftFromAnotherPublisher(participant.name());
        }
        listUsers = roomSession.users;
        if (listUsers[user.id]) {
          delete listUsers[user.id];
          setRoomSession((prevState) => ({
            ...prevState,
            // users: listUsers,
            // stats: {
            //   countParticipants: prevState.stats.countParticipants - 1,
            //   countChatMessages: prevState.stats.countChatMessages,
            // },
          }));
        }
      })
      .on(ROOM_EVENT.PUBLISHED, (participant) => {
        console.log("ROOM_EVENT.PUBLISHED", participant.name(), participant);
      })
      .on(ROOM_EVENT.FAILED, (room, info) => {
        console.error("ROOM_EVENT.FAILED", room, info);
        setRoomInstance(null);
        setStreamsInit(false);
      })
      .on(ROOM_EVENT.MESSAGE, (message) => {
        console.log("ROOM_EVENT.MESSAGE", message.from, message.text);
        const command = JSON.parse(message.text);

        if (command.object === "session" && command.action === "sync") {
          setMessageFromAnotherPublisher({
            broadcasting: command.data.streams.broadcasting,
            message,
          });
        }
        if (command.object === "notice" && command.action === "chat") {
          setRoomSession((prevState) => ({
            ...prevState,
            // stats: {
            //   countParticipants: prevState.stats.countParticipants,
            //   countChatMessages: (prevState.stats.countChatMessages + 1),
            // },
          }));
        }
      });
  }

  function startRoom() {
    if (!session) {
      return;
    }
    //const profile_id = 777;
    const urlWCS = session.getServerUrl();
    const roomUsername = `p-${roomUid}-${getRandomInt(111111, 999999)}`;
    const { SESSION_STATUS } = Flashphoner.constants;

    const roomConnection = Flashphoner.roomApi
      .connect({ urlServer: urlWCS, username: roomUsername }, Flashphoner)
      .on(SESSION_STATUS.FAILED, (session) => {
        console.log("room session FAILED", session);
      })
      .on(SESSION_STATUS.DISCONNECTED, (session) => {
        console.log("room session DISCONNECTED", session);
      })
      .on(SESSION_STATUS.ESTABLISHED, (session) => {
        console.log("room session ESTABLISHED", session.username(), session);
        joinRoom(roomConnection);
      });
  }

  useEffect(() => {
    if (
      messageFromAnotherPublisher &&
      messageFromAnotherPublisher.broadcasting
    ) {
      setStatePrimaryPublisherBroadcast(
        messageFromAnotherPublisher.message.from.name()
      );
    }
    if (
      messageFromAnotherPublisher &&
      !messageFromAnotherPublisher.broadcasting &&
      messageFromAnotherPublisher.message.from.name() ===
        statePrimaryPublisherBroadcast
    ) {
      setStatePrimaryPublisherBroadcast(false);
    }
  }, [messageFromAnotherPublisher]);

  useEffect(() => {
    if (leftFromAnotherPublisher === statePrimaryPublisherBroadcast) {
      setStatePrimaryPublisherBroadcast(false);
    }
  }, [leftFromAnotherPublisher]);

  function parseUserName(name) {
    const r = name.match(/^(u|c|p)-(\d+)-(\d+)$/);
    if (r) {
      return {
        type: r[1],
        id: r[2],
        nonce: r[3],
        name,
      };
    }
    return null;
  }

  function createRoomCommand(object, action, data) {
    const command = { object, action };
    if (data) {
      command.data = data;
    }
    return JSON.stringify(command);
  }

  function sendSession(participant) {
    if (roomSession.streams.init && !statePrimaryPublisherBroadcast) {
      participant.sendMessage(
        createRoomCommand("session", "sync", roomSession)
      );
    }
  }

  // session synchronization between rooms
  function syncSession() {
    if (!roomInstance) {
      return;
    }

    roomInstance
      .getParticipants()
      .map((participant) => sendSession(participant));
  }

  useEffect(() => {
    if (roomSession.streams.init) {
      syncSession();
    }
    checkStatePossibilityStartBroadcast();
  }, [roomSession]);

  // get list devices
  useEffect(() => {
    Flashphoner.getMediaDevices(null, true)
      .then((list) => {
        if (list.audio && list.audio.length > 0) {
          setOptionsAudio(list.audio);
        }
        if (list.video && list.video.length > 0) {
          setOptionsVideo(list.video);
        }
      })
      .catch(() => console.log("error getMediaDevices"));
  }, []);

  function transformOptionsItem(item) {
    return { value: item.id, label: item.label };
  }

  function getOptionsVideo(options = []) {
    const values = [{ value: "", label: "Не выбрано" }];

    if (!isMobileDevice) {
      values.push({ value: "screen", label: "Экран" });
    }

    return values.concat(options.map(transformOptionsItem));
  }

  function getOptionsAudio(options = []) {
    return [{ value: "mute", label: "Без звука" }].concat(
      options.map(transformOptionsItem)
    );
  }

  // stop streams and exit the room when switching to another page or closing the tab
  useEffect(
    () => () => {
      if (primaryStream) {
        primaryStream.stop();
      }
    },
    [primaryStream]
  );

  useEffect(
    () => () => {
      if (secondaryStream) {
        secondaryStream.stop();
      }
    },
    [secondaryStream]
  );

  useEffect(
    () => () => {
      if (roomInstance) {
        roomInstance.leave();
      }
    },
    [roomInstance]
  );

  // switching sources audio
  useEffect(() => {
    if (primaryAudioSrc.value !== "mute") {
      setSecondaryAudioSrc({ value: "mute", label: "Без звука" });
    }
  }, [primaryAudioSrc]);

  useEffect(() => {
    if (secondaryAudioSrc.value !== "mute") {
      setPrimaryAudioSrc({ value: "mute", label: "Без звука" });
    }
  }, [secondaryAudioSrc]);

  useEffect(() => {
    if (translationStore.errorMessage) {
      Modal.warn({
        title: "Ошибка:",
        content: `${translationStore.errorMessage}`,
        okText: "Закрыть",
        width: "fit-content",
      });
    }
  }, [translationStore.errorMessage]);

  function handlePrimaryVideoChange(value) {
    setPrimaryVideoSrc(value);
  }

  function handleSecondaryVideoChange(value) {
    setSecondaryVideoSrc(value);
  }

  return (
    <div>
      <div className={"wrapOptions"}>
        {ListInterfaceTemplates.map((templateItem) => (
          <div key={templateItem.id}>
            <input
              type="radio"
              name="interfaceTemplate"
              id={`interfaceTemplate${templateItem.id}`}
              value={templateItem.id}
              checked={roomSession.interface.template === templateItem.id}
              disabled={
                !(
                  !stateCaptureSecondaryStream &&
                  !roomSession.streams.broadcasting &&
                  (templateItem.id === 1 || templateItem.id === 2)
                )
              }
              onChange={(event) => setInterfaceTemplate(event.target.value)}
            />
            <label htmlFor={`interfaceTemplate${templateItem.id}`}>
              {templateItem.title}
            </label>
          </div>
        ))}
      </div>
      <div className={"wrapVideoStreem"}>
        <div className={"wrapPrimaryStreem"}>
          <div className={"titleStreem"}>Основной поток</div>
          <div className={"videoSettings"}>
            <div className={"videoSettingsVideo"}>
              <label>Источник видео</label>
              <Select
                value={primaryVideoSrc}
                labelInValue
                options={getOptionsVideo(optionsVideo)}
                onChange={(value) => handlePrimaryVideoChange(value)}
                disabled={stateCapturePrimaryStream}
                className="wrap-react-select"
              />
            </div>
            <div className={"videoSettingsAudio"}>
              <label>Источник аудио</label>
              <Select
                labelInValue
                value={primaryAudioSrc}
                options={getOptionsAudio(optionsAudio)}
                disabled={
                  stateCapturePrimaryStream ||
                  (secondaryAudioSrc.value !== "mute" &&
                    stateCaptureSecondaryStream)
                }
                onChange={(value) => setPrimaryAudioSrc(value)}
                className="wrap-react-select"
              />
            </div>
            {roomSession.interface.template === 3 && (
              <div>
                <label>Видео</label>
                <Select
                  labelInValue
                  options={optionsSelectedQtyVideo}
                  placeholder="Не выбрано"
                  disabled={!!stateCapturePrimaryStream}
                  classNamePrefix="react-select"
                  className="wrap-react-select"
                />
              </div>
            )}
          </div>

          <div className={"bg-color video-wrap video-wrap-16x9"}>
            <div className="video-wrap-proportion"></div>
            {!isMobileDevice ? (
              <div id="primaryVideo">
                {!stateCapturePrimaryStream && primaryVideoSrc.value && (
                  <div className={"videoNoise"} />
                )}

                <div className={"streamPublishInfo"}>
                  <p>
                    Ключ потока:{" "}
                    <b>
                      {roomUid}:main:{translation.uid}
                    </b>
                  </p>
                  <p>
                    Сервер:{" "}
                    <b>
                      rtmp://{CONFIG.BASE_PUBLISH_WCS_HOST.split("//")[1]}/live/
                    </b>
                  </p>
                </div>

                {!stateCapturePrimaryStream && (
                  <>
                    <Button
                      className={clsx("btnStartCapture")}
                      onClick={startCapturePrimaryStream}
                      disabled={
                        !primaryVideoSrc.value ||
                        stateLoaderBtnStartPrimaryBroadcast ||
                        translation?.is_live
                      }
                      type="primary"
                    >
                      {stateLoaderBtnStartPrimaryBroadcast && (
                        <Spiner
                          className={"spin-xs"}
                          style={{ top: 3, left: -10 }}
                        />
                      )}
                      {"Захват потока"}
                    </Button>
                  </>
                )}
                {stateCapturePrimaryStream && (
                  <Button
                    className={clsx("btnStopCapture")}
                    onClick={() => {
                      stopCapturePrimaryStream();
                      hidePrimaryPublishInfo();
                    }}
                    disabled={roomSession.streams.broadcasting}
                    type="primary"
                  >
                    {"Остановить захват потока"}
                  </Button>
                )}
              </div>
            ) : (
              <div id="primaryVideo" className={"primaryMobileVideo"}>
                {!stateCapturePrimaryStream && primaryVideoSrc.value && (
                  <div className={"videoNoise"} />
                )}

                <div className={"streamPublishInfo"}>
                  <p>
                    Ключ потока:{" "}
                    <b>
                      {roomUid}:main:{translation.uid}
                    </b>
                  </p>
                  <p>
                    Сервер:{" "}
                    <b>
                      rtmp://{CONFIG.BASE_PUBLISH_WCS_HOST.split("//")[1]}/live/
                    </b>
                  </p>
                </div>

                {!stateCapturePrimaryStream && (
                  <>
                    <Button
                      className={clsx("btnStartCapture")}
                      onClick={startCapturePrimaryStream}
                      disabled={
                        !primaryVideoSrc.value ||
                        stateLoaderBtnStartPrimaryBroadcast ||
                        translation?.is_live
                      }
                      type="primary"
                    >
                      {stateLoaderBtnStartPrimaryBroadcast && (
                        <Spiner
                          className={"spin-xs"}
                          style={{ top: 3, left: -10 }}
                        />
                      )}
                      {"Захват потока"}
                    </Button>
                  </>
                )}
                {stateCapturePrimaryStream && (
                  <>
                    <div className={"mobileStream"}>
                      <DoneIcon color={"#27ae60"} />
                      Поток захвачен
                    </div>
                    <Button
                      className={clsx("btnStopCapture")}
                      onClick={() => {
                        stopCapturePrimaryStream();
                        hidePrimaryPublishInfo();
                      }}
                      disabled={roomSession.streams.broadcasting}
                      type="primary"
                    >
                      {"Остановить захват потока"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="wrapAdditionalStreem">
          {(roomSession.interface.template === 2 ||
            roomSession.interface.template === 4) && (
            <div className={"full-width"}>
              <div className={"titleStreem"}>Дополнительные потоки</div>
              <div className={"videoSettings"}>
                <div className={"videoSettingsVideo"}>
                  <label>Источник видео</label>
                  <Select
                    labelInValue
                    value={secondaryVideoSrc}
                    options={getOptionsVideo(optionsVideo)}
                    onChange={(value) => handleSecondaryVideoChange(value)}
                    disabled={stateCaptureSecondaryStream}
                    placeholder="Не выбрано"
                    className="wrap-react-select"
                  />
                </div>
                <div className={"videoSettingsAudio"}>
                  <label>Источник аудио</label>
                  <Select
                    labelInValue
                    value={secondaryAudioSrc}
                    disabled={
                      stateCaptureSecondaryStream ||
                      (primaryAudioSrc.value !== "mute" &&
                        stateCapturePrimaryStream)
                    }
                    options={getOptionsAudio(optionsAudio)}
                    onChange={(value) => setSecondaryAudioSrc(value)}
                    className="wrap-react-select"
                  />
                </div>
                {roomSession.interface.template === 4 && (
                  <div>
                    <label>Видео</label>
                    <Select
                      labelInValue
                      options={optionsSelectedQtyVideo}
                      className="wrap-react-select"
                    />
                  </div>
                )}
              </div>
              <div className={"bg-color video-wrap video-wrap-16x9"}>
                <div className="video-wrap-proportion"></div>
                <div id="secondaryVideo">
                  {!stateCaptureSecondaryStream && secondaryVideoSrc.value && (
                    <div className={"videoNoise"} />
                  )}

                  <div id={"streamAdvancedPublishInfo"}>
                    <p>
                      Ключ потока:{" "}
                      <b>
                        {roomUid}:advanced:{translation.uid}
                      </b>
                    </p>
                    <p>
                      Сервер:{" "}
                      <b>
                        rtmp://{CONFIG.BASE_PUBLISH_WCS_HOST.split("//")[1]}
                        /live/
                      </b>
                    </p>
                  </div>

                  {!stateCaptureSecondaryStream && (
                    <Button
                      className={clsx("btnStartCapture")}
                      onClick={startCaptureSecondaryStream}
                      disabled={
                        !secondaryVideoSrc.value ||
                        stateLoaderBtnStartSecondaryBroadcast ||
                        translation?.is_live
                      }
                      type="primary"
                    >
                      {stateLoaderBtnStartSecondaryBroadcast && (
                        <Spiner
                          className={"spin-xs"}
                          style={{ top: 3, left: -10 }}
                        />
                      )}
                      {"Захват потока"}
                    </Button>
                  )}
                  {stateCaptureSecondaryStream && (
                    <Button
                      onClick={() => {
                        stopCaptureSecondaryStream();
                        hideAdvancedPublishInfo();
                      }}
                      type="primary"
                      className={clsx("btnStopCapture")}
                      disabled={roomSession.streams.broadcasting}
                    >
                      {"Остановить захват потока"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          {roomSession.interface.template === 1 && (
            <div className={"full-width videoInfoBlock"}>
              <div className={"titleStreem"}>Дополнительная информация</div>
              <div className={"bg-color video-wrap video-wrap-16x9"}>
                <div className="video-wrap-proportion"></div>
              </div>
            </div>
          )}
          <div className={"boxButtons"}>
            {!translationStore.broadcasting && !translation?.is_live && (
              <>
                <Button
                  onClick={startBroadcast}
                  disabled={
                    !statePossibilityStartBroadcast ||
                    statePrimaryPublisherBroadcast ||
                    translationStore.pending
                  }
                  type="success"
                  className="ant-btn-primary"
                >
                  {translationStore.pending && <Spiner className={"spin-xs"} />}
                  Запустить эфир
                </Button>
              </>
            )}
            {(translationStore.broadcasting || translation?.is_live) && (
              <>
                <Button
                  className={"btnControl"}
                  type="default"
                  onClick={() => window.open(`/control?room=${roomUid}`)}
                >
                  Контрольная панель
                </Button>
                <Button
                  className={"btnControl btnMobile"}
                  type="default"
                  onClick={() => window.open(`/control?room=${roomUid}`)}
                >
                  Панель
                </Button>

                <Button
                  className="btnCancel"
                  onClick={stopBroadcast}
                  danger
                  type="primary"
                  disabled={translationStore.pending}
                >
                  {translationStore.pending && <Spiner className={"spin-xs"} />}
                  Остановить эфир
                </Button>
                <Button
                  className="btnCancel btnMobile"
                  onClick={stopBroadcast}
                  danger
                  type="primary"
                  disabled={translationStore.pending}
                >
                  {translationStore.pending && <Spiner className={"spin-xs"} />}
                  Остановить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={"streamInfo"}>
        <h3>Primary stream</h3>
        {Object.keys(primaryVideoStats).map((key) => (
          <div key={key}>
            {key}: {primaryVideoStats[key]}
          </div>
        ))}

        <h3>Secondary stream</h3>
        {Object.keys(secondaryVideoStats).map((key) => (
          <div key={`sec_${key}`}>
            {key}: {secondaryVideoStats[key]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default observer(VideoStreamSettings);
