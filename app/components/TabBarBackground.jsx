import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const height = 70;

export default function TabBarBackground() {


  return (
  <Svg
      width={width}
      height="90"
      viewBox="0 0 375 90"
      style={StyleSheet.absoluteFillObject}
    >
      <Path
        d="
          M0 0
          H135
          C150 0, 150 40, 187.5 40
          C225 40, 225 0, 240 0
          H375
          V90
          H0
          Z
        "
        fill="#FFFFFF"
      />
    </Svg>
  );
}

// export const absoluteFillObject: AbsoluteFillStyle;