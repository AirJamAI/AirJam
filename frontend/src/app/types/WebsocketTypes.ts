export type WebsocketFrame = {
  data: string;
  cols: ColData[];
};

export type ImgData = {
  data: string;
  cols: ColData[];
  time: number;
};

export type ColData = {
  name: string;
  col: number;
};
