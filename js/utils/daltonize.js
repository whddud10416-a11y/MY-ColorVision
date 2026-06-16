// Linear Simulation Matrices for Opia (100% severity)
const matrices = {
  protan: [ [0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758] ],
  deutan: [ [0.625, 0.375, 0], [0.700, 0.300, 0], [0, 0.300, 0.700] ],
  tritan: [ [0.950, 0.050, 0], [0, 0.433, 0.567], [0, 0.475, 0.525] ]
};

export function processPixels(imageData, type, severity, mode, intensityScale) {
  if (type === 'default' || severity === 0) return imageData;
  const d = imageData.data;
  const finalSeverity = Math.min(1.0, severity * intensityScale);
  
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i+1], b = d[i+2];
    let simR, simG, simB;

    if (type === 'achromato') {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      simR = luma; simG = luma; simB = luma;
    } else {
      let mat1, mat2;
      if(type === 'redgreen') { mat1 = matrices.protan; mat2 = matrices.deutan; }
      else if(type === 'redblue') { mat1 = matrices.protan; mat2 = matrices.tritan; }
      else if(type === 'greenblue') { mat1 = matrices.deutan; mat2 = matrices.tritan; }
      
      if (mat1 && mat2) {
          simR = r * ((mat1[0][0] + mat2[0][0])/2) + g * ((mat1[0][1] + mat2[0][1])/2) + b * ((mat1[0][2] + mat2[0][2])/2);
          simG = r * ((mat1[1][0] + mat2[1][0])/2) + g * ((mat1[1][1] + mat2[1][1])/2) + b * ((mat1[1][2] + mat2[1][2])/2);
          simB = r * ((mat1[2][0] + mat2[2][0])/2) + g * ((mat1[2][1] + mat2[2][1])/2) + b * ((mat1[2][2] + mat2[2][2])/2);
      } else {
          const mat = matrices[type];
          simR = r * mat[0][0] + g * mat[0][1] + b * mat[0][2];
          simG = r * mat[1][0] + g * mat[1][1] + b * mat[1][2];
          simB = r * mat[2][0] + g * mat[2][1] + b * mat[2][2];
      }
    }

    // Interpolate for Anomaly (Severity)
    simR = r * (1 - finalSeverity) + simR * finalSeverity;
    simG = g * (1 - finalSeverity) + simG * finalSeverity;
    simB = b * (1 - finalSeverity) + simB * finalSeverity;

    if (mode === 'simulate') {
      d[i] = simR; d[i+1] = simG; d[i+2] = simB;
    } else {
      // Daltonization mode
      let errR = r - simR;
      let errG = g - simG;
      let errB = b - simB;

      let corrR = r, corrG = g, corrB = b;
      let overdrive = Math.max(1.0, intensityScale);

      // Shift colors that they can't see into channels they CAN see
      // Intensified Daltonization to break Ishihara plates
      if (type === 'protan') {
        // Cannot see red: heavily shift red error to blue, keeping brightness
        corrG += errR * 0.5 * overdrive;
        corrB += errR * 1.5 * overdrive;
      } else if (type === 'deutan') {
        // Cannot see green: shift green error to blue and red
        corrR += errG * 0.5 * overdrive;
        corrB += errG * 1.5 * overdrive;
      } else if (type === 'tritan') {
        // Cannot see blue: shift blue error to red and green
        corrR += errB * 1.5 * overdrive;
        corrG += errB * 0.5 * overdrive;
      } else if (type === 'achromato') {
        // 전색맹 환자는 오직 명도(밝기)만 인지합니다. 채도를 올려도 의미가 없습니다.
        // 따라서 '색상 차이'를 '명암 차이'로 완전히 억지로 변환해 주어야 합니다!
        // 빨강은 밝게(White), 초록/파랑은 어둡게(Black) 만들어서 경계선을 만듭니다.
        let redGreenDiff = r - g; // 빨간색일수록 양수, 초록색일수록 음수
        let newLuma = simR + (redGreenDiff * 1.0 * overdrive);
        
        corrR = newLuma;
        corrG = newLuma;
        corrB = newLuma;
      } else if (type === 'redgreen') {
        // Red-Green composite: explicitly push reds to bright blue, greens to dark yellow
        // This guarantees differentiation on Ishihara plates
        corrB += errR * 1.5 * overdrive;
        corrR -= errG * 0.5 * overdrive;
        corrG -= errG * 0.5 * overdrive;
        corrB -= errG * 0.5 * overdrive;
      } else if (type === 'redblue') {
        // Push Red to Green, Blue to Dark/Yellow
        corrG += errR * 1.5 * overdrive;
        corrR += errB * 0.5 * overdrive;
        corrG -= errB * 0.5 * overdrive;
        corrB -= errB * 1.5 * overdrive;
      } else if (type === 'greenblue') {
        // Push Green to Red, Blue to Dark
        corrR += errG * 1.5 * overdrive;
        corrR -= errB * 0.5 * overdrive;
        corrG -= errB * 0.5 * overdrive;
        corrB -= errB * 1.5 * overdrive;
      }

      d[i] = Math.min(255, Math.max(0, corrR));
      d[i+1] = Math.min(255, Math.max(0, corrG));
      d[i+2] = Math.min(255, Math.max(0, corrB));
    }
  }
  return imageData;
}

export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

export function applyDaltonizeToColor(r, g, b, type, severity = 0.5, mode = 'correct', intensityScale = 1.0) {
  if (type === 'default' || severity === 0) return [r, g, b];
  const finalSeverity = Math.min(1.0, severity * intensityScale);
  
  let simR, simG, simB;

  if (type === 'achromato') {
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    simR = luma; simG = luma; simB = luma;
  } else {
    let mat1, mat2;
    if(type === 'redgreen') { mat1 = matrices.protan; mat2 = matrices.deutan; }
    else if(type === 'redblue') { mat1 = matrices.protan; mat2 = matrices.tritan; }
    else if(type === 'greenblue') { mat1 = matrices.deutan; mat2 = matrices.tritan; }
    
    if (mat1 && mat2) {
        simR = r * ((mat1[0][0] + mat2[0][0])/2) + g * ((mat1[0][1] + mat2[0][1])/2) + b * ((mat1[0][2] + mat2[0][2])/2);
        simG = r * ((mat1[1][0] + mat2[1][0])/2) + g * ((mat1[1][1] + mat2[1][1])/2) + b * ((mat1[1][2] + mat2[1][2])/2);
        simB = r * ((mat1[2][0] + mat2[2][0])/2) + g * ((mat1[2][1] + mat2[2][1])/2) + b * ((mat1[2][2] + mat2[2][2])/2);
    } else {
        const mat = matrices[type];
        simR = r * mat[0][0] + g * mat[0][1] + b * mat[0][2];
        simG = r * mat[1][0] + g * mat[1][1] + b * mat[1][2];
        simB = r * mat[2][0] + g * mat[2][1] + b * mat[2][2];
    }
  }

  // Interpolate for Anomaly (Severity)
  simR = r * (1 - finalSeverity) + simR * finalSeverity;
  simG = g * (1 - finalSeverity) + simG * finalSeverity;
  simB = b * (1 - finalSeverity) + simB * finalSeverity;

  if (mode === 'simulate') {
    return [Math.round(simR), Math.round(simG), Math.round(simB)];
  } else {
    // Daltonization mode
    let errR = r - simR;
    let errG = g - simG;
    let errB = b - simB;

    let corrR = r, corrG = g, corrB = b;
    let overdrive = Math.max(1.0, intensityScale);

    if (type === 'protan') {
      corrG += errR * 0.5 * overdrive;
      corrB += errR * 1.5 * overdrive;
    } else if (type === 'deutan') {
      corrR += errG * 0.5 * overdrive;
      corrB += errG * 1.5 * overdrive;
    } else if (type === 'tritan') {
      corrR += errB * 1.5 * overdrive;
      corrG += errB * 0.5 * overdrive;
    } else if (type === 'achromato') {
      let redGreenDiff = r - g; 
      let newLuma = simR + (redGreenDiff * 1.0 * overdrive);
      corrR = newLuma;
      corrG = newLuma;
      corrB = newLuma;
    } else if (type === 'redgreen') {
      corrB += errR * 1.5 * overdrive;
      corrR -= errG * 0.5 * overdrive;
      corrG -= errG * 0.5 * overdrive;
      corrB -= errG * 0.5 * overdrive;
    } else if (type === 'redblue') {
      corrG += errR * 1.5 * overdrive;
      corrR += errB * 0.5 * overdrive;
      corrG -= errB * 0.5 * overdrive;
      corrB -= errB * 1.5 * overdrive;
    } else if (type === 'greenblue') {
      corrR += errG * 1.5 * overdrive;
      corrR -= errB * 0.5 * overdrive;
      corrG -= errB * 0.5 * overdrive;
      corrB -= errB * 1.5 * overdrive;
    }

    return [
      Math.min(255, Math.max(0, Math.round(corrR))),
      Math.min(255, Math.max(0, Math.round(corrG))),
      Math.min(255, Math.max(0, Math.round(corrB)))
    ];
  }
}

