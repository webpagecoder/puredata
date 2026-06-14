'use strict';

import { GlobalConfig } from './config/GlobalConfig.ts';
import { PureData } from './PureData.ts';

const pd = new PureData(GlobalConfig);

export { pd };
