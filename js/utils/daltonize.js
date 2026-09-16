// Linear Simulation Matrices for Opia (100% severity)
const matrices = {
  protan: [ [0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758] ],
  deutan: [ [0.625, 0.375, 0], [0.700, 0.300, 0], [0, 0.300, 0.700] ],
  tritan: [ [0.950, 0.050, 0], [0, 0.433, 0.567], [0, 0.475, 0.525] ]
};

export function processPixels(imageData, type, severity, mode, intensityScale) {
  if (type === 'default' || severity === 0) return imageData;
  const d = imageData.data;
  const len = d.length;
  const finalSeverity = Math.min(1.0, severity * intensityScale);
  const invSeverity = 1 - finalSeverity;
  const overdrive = Math.max(1.0, intensityScale);

  const isAchromato = type === 'achromato';
  let m00 = 1, m01 = 0, m02 = 0;
  let m10 = 0, m11 = 1, m12 = 0;
  let m20 = 0, m21 = 0, m22 = 1;

  if (!isAchromato) {
    let mat1 = null, mat2 = null;
    if (type === 'redgreen') { mat1 = matrices.protan; mat2 = matrices.deutan; }
    else if (type === 'redblue') { mat1 = matrices.protan; mat2 = matrices.tritan; }
    else if (type === 'greenblue') { mat1 = matrices.deutan; mat2 = matrices.tritan; }

    if (mat1 && mat2) {
      m00 = (mat1[0][0] + mat2[0][0]) * 0.5;
      m01 = (mat1[0][1] + mat2[0][1]) * 0.5;
      m02 = (mat1[0][2] + mat2[0][2]) * 0.5;
      m10 = (mat1[1][0] + mat2[1][0]) * 0.5;
      m11 = (mat1[1][1] + mat2[1][1]) * 0.5;
      m12 = (mat1[1][2] + mat2[1][2]) * 0.5;
      m20 = (mat1[2][0] + mat2[2][0]) * 0.5;
      m21 = (mat1[2][1] + mat2[2][1]) * 0.5;
      m22 = (mat1[2][2] + mat2[2][2]) * 0.5;
    } else if (matrices[type]) {
      const mat = matrices[type];
      m00 = mat[0][0]; m01 = mat[0][1]; m02 = mat[0][2];
      m10 = mat[1][0]; m11 = mat[1][1]; m12 = mat[1][2];
      m20 = mat[2][0]; m21 = mat[2][1]; m22 = mat[2][2];
    }
  }

  if (mode === 'simulate') {
    for (let i = 0; i < len; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      let simR, simG, simB;

      if (isAchromato) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        simR = luma; simG = luma; simB = luma;
      } else {
        simR = r * m00 + g * m01 + b * m02;
        simG = r * m10 + g * m11 + b * m12;
        simB = r * m20 + g * m21 + b * m22;
      }

      d[i]     = r * invSeverity + simR * finalSeverity;
      d[i + 1] = g * invSeverity + simG * finalSeverity;
      d[i + 2] = b * invSeverity + simB * finalSeverity;
    }
    return imageData;
  }

  // Daltonize mode
  for (let i = 0; i < len; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    let simR, simG, simB;

    if (isAchromato) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      simR = luma; simG = luma; simB = luma;
    } else {
      simR = r * m00 + g * m01 + b * m02;
      simG = r * m10 + g * m11 + b * m12;
      simB = r * m20 + g * m21 + b * m22;
    }

    simR = r * invSeverity + simR * finalSeverity;
    simG = g * invSeverity + simG * finalSeverity;
    simB = b * invSeverity + simB * finalSeverity;

    const errR = r - simR;
    const errG = g - simG;
    const errB = b - simB;

    let corrR = r, corrG = g, corrB = b;

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
      const redGreenDiff = r - g;
      const newLuma = simR + (redGreenDiff * 1.0 * overdrive);
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

    d[i]     = Math.min(255, Math.max(0, corrR));
    d[i + 1] = Math.min(255, Math.max(0, corrG));
    d[i + 2] = Math.min(255, Math.max(0, corrB));
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

