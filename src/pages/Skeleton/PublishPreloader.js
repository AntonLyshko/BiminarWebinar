import React from "react";

import Select from "antd/es/select";
import clsx from "clsx";

import { ListInterfaceTemplates } from "../../components/getListInterfaceTemplates";

const PublishPreloader = () => {
  return (
    <div className="container clearfix">
      <div className={"boxTabSwitches"}>
        <div className={clsx("tabSwitchesItem")}>Настройка видео потоков</div>
      </div>
      <div className={"boxTabs"}>
        <div className={"wrapOptions"}>
          {ListInterfaceTemplates.map((templateItem) => (
            <div key={templateItem.id}>
              <input
                type="radio"
                name="interfaceTemplate"
                id={`interfaceTemplate${templateItem.id}`}
                value={templateItem.id}
                disabled
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
                  value={"Не выбрано"}
                  labelInValue
                  disabled={true}
                  className="wrap-react-select"
                />
              </div>
              <div className={"videoSettingsAudio"}>
                <label>Источник аудио</label>
                <Select
                  value={"Не выбрано"}
                  labelInValue
                  disabled={true}
                  className="wrap-react-select"
                />
              </div>
            </div>

            <div className={"video-wrap video-wrap-16x9"}>
              <div className="video-wrap-proportion"></div>
              <div id="primaryVideo"></div>
            </div>
          </div>

          <div className={"wrapAdditionalStreem videoInfoBlock"}>
            <div className={"titleStreem"}>Дополнительная информация</div>
            <div className={"video-wrap video-wrap-16x9"}>
              <div className="video-wrap-proportion"></div>
            </div>
          </div>

          <div className={"boxButtons"}>
            <button className="btn btnSuccess" disabled={true} type="button">
              Запустить эфир
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishPreloader;
