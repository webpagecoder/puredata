'use strict';

import { GLOBAL_CONFIG } from './config/GlobalConfig.ts';
import { PureData } from './PureData.ts';

const pd = new PureData(GLOBAL_CONFIG);

export { pd };
