varying vec2 vTextureCoord;
uniform vec2 inputPixel;
uniform sampler2D uSampler;
uniform vec2 size;
uniform float offsetX; // 光束偏移距离（归一化）

void main(void)
{
  vec2 uv = vTextureCoord.xy * inputPixel.xy / size.xy;
  vec4 color = texture2D(uSampler, vTextureCoord);
  float y = uv.y;
  float x = uv.x - offsetX;
  if (color.a >= 1.0) {
    // 一粗一细两束光线
    if ((y < -x && y > -x - 0.1) || (y < -x - 0.2 && y > -x - 0.25)){
      color = mix(color, vec4(1.0), 0.5);
    }
  }
  gl_FragColor = color;
}