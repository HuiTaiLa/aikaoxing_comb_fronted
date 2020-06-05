<template>
  <div class="painting-box" id="paintingBox" style="">
    <div class="animateBox">

      <div class="wrapper">
        <div class="painting-top">
          <div class="control-button">
            <div class="items sizeButton active"><span class="icon-m_handwriting_brush_tool"></span><i class="yuan"></i></div>
            <div class="items rubberButton"><span class="icon-m_handwriting_eraser"></span></div>
            <div class="items revokeButton"><span class="icon-m_handwriting_undo"></span></div>
            <div class="items clearButton"><span class="icon-m_handwriting_delete"></span></div>
          </div>

          <span class="title">手写板</span>
          <div class="btn-right-box">
            <div class="hidePainting">
              <button>收起手写板</button>
            </div>
            <div class="savePaintingButton">
              <button>提交答案</button>
            </div>
          </div>
        </div>
        <canvas class="canvas" width="923" height="670"></canvas>

      </div>

      <div class="changeType">
        <div class="top">
          <span class="txt">笔类型</span>
          <div class="pen-type">
            <div class="active" data-type="pen"><span class="icon-m_handwriting_brush"></span></div>
            <div data-type="line"><span class="icon-m_handwriting_line"></span></div>
            <div data-type="circular"><span class="icon-m_handwriting_circle"></span></div>
            <div data-type="square"><span class="icon-m_handwriting_rectangle"></span></div>
          </div>
        </div>
        <div class="center">
          <span class="txt">细-粗</span>
          <div class="pen-size">
            <span class="backgroundBox"></span>
            <input type="range" min="1" max="30" value="1" step="1" name="penSize">
          </div>
        </div>
        <div class="bottom">
          <span class="txt">颜色</span>
          <div class="pen-color">
            <div class="active"><span class="black" data-text="黑色" data-color="#000000"></span></div>
            <div><span class="red" data-text="红色" data-color="#ff0000"></span></div>
            <div><span class="yellow" data-text="黄色" data-color="#FFFF00"></span></div>
            <div><span class="blue" data-text="蓝色" data-color="#0000ff"></span></div>
            <div><span class="green" data-text="绿色" data-color="#00ff00"></span></div>
            <div id="colorPicker">
              <a class="color">
                <div class="colorInner"></div>
                <span class="img-color icon-m_handwriting_palette"></span>

              </a>
              <div class="track" style="background-image: none;"><canvas width="150" height="150"></canvas></div>
              <div class="colorInput hidden">#000000</div>
            </div>
          </div>
        </div>
      </div>

      <div class="offImgs" style="display: none;"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Box',
  }
</script>
