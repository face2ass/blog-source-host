varying vec2 vTextureCoord;// 区间[0,1]

uniform sampler2D uSampler;

uniform float time;
uniform float period;// 周期
uniform float velocity;// 波速
uniform float amplitude;// 最大振幅
uniform float brightness;// 高光亮度

float PI = 3.14159;

void main(void){
  float v = sin((vTextureCoord.x - time * velocity) * 2.0 * PI * period);
  vec4 color = texture2D(uSampler, vTextureCoord + vec2(0.0, v * amplitude * vTextureCoord.x));

  if (color.a > 0.0) {
    // 取x正方向+0.001，获取函数单调性
    float delta = sin((vTextureCoord.x + 0.001 - time * velocity) * 2.0 * PI * period) - v;
    if (delta < 0.0) {
      color = mix(color, vec4(1.0), -delta * brightness);
    }
  }
  gl_FragColor = color;
}