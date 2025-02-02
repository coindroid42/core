/**
 * prefix: string - префикс для core, по дефолту /api/0.5
 iiko: IikoApi
 timeSyncBalance: number - время синхронизации баланса в секундах
 timeSyncMenu: number - время синхронизации меню в секундах
 timeSyncStreets: number - время синхронизации улиц в часах
 images: ImageConfig
 development: boolean - режим разработки, включает доступ к RMS напрямую
 masterKey: string - ключ для доступа к RMS API, если режим разработчкика выключен
 city: string - город, в котором находется ресторан
 email: {
      server: {
        user: string - имя пользователя
        password: string - пароль
        host: string - хост
        ssl: boolean
      },
      template: string - путь к .ejs файлу, который рендерить при отправке email
    },
 timezone: string - временная зона ресторана
 GeocodeConfig: {
      geocode: string - адаптер геокодинга
      customMaps: string - адаптер загрузки карты с url
      check: string - адаптер для проверки вхождения адресса в зону
      api: string - ключ API для карт
      customMap: string - ссылка на карту для загрузки
    },
 timeSyncMap:number - время синхронизации карты
 checkType: string - тип проверки заказа rms/native
 zoneDontWork: string - сообщение о невозможности доставки
 deliveryWorkTime: Time[] - время работы ресторана
 groupShift: string - смещение группы для синхронизации
 rmsAdapter: string - адаптер RMS
 phoneRegex?: string - regex для проверки телефона
 nameRegex?: string - regex для проверки имени
 check: {
      requireAll: boolean - проверка считается успешной только если ВСЕ системы проверки ответили успешно
      notRequired: boolean - проверка считается успешной даже если НЕ ОДНА система не ответила успешно, игнорируется, если requireAll = true
    }
 */
import ImageConfig from "../adapters/image/ImageConfig";
import { Time } from "./Cause";
export default interface Config {
  project: string;
  city: string;
  timezone: string;
  project_slug: string;
  websiteDomain: string;
  orderPage: string;
  timeSyncBalance: number;
  timeSyncMenu: number;
  timeSyncStreets: number;
  checkType: string;
  groupShift: string;
  rmsAdapter: string;
  images: ImageConfig;
  prefix: string;
  email?: {
    server: {
      user: string;
      password: string;
      host: string;
      ssl: boolean;
    };
    template: string;
  };
  map: {
    geocode: string;
    customMaps: string;
    check: string;
    api: string;
    customMap: string;
    distance: string;
  };
  timeSyncMap: number;
  zoneDontWork?: string;
  deliveryWorkTime: Time[];
  phoneRegex?: string;
  nameRegex?: string;
  check: {
    requireAll: boolean;
    notRequired: boolean;
  };
  order: {
    requireAll: boolean;
    notRequired: boolean;
  };
  zoneNotFound?: string;
  comment?: string;
  orderFail: string;
  notInZone: string;
  awaitEmitterTimeout?: number;
  [key:string]: any;
}
