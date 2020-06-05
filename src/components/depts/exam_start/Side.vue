<template>
  <div class="nav-wrapper">
    <div class="nav nav-status nav-operation">
      <ul class="menu-items">
        <li class="menu-item menu-item-time ">
          <div class="item-label">剩余时间</div>
          <div class="item-data" id="timeDown">00:00:00</div>
        </li>
        <li class="menu-item menu-item-process">
          <div class="item-label">当前进度</div>
          <div class="item-data">
            <span id="commitCount">0</span>/<span id="totalCount">0</span>
          </div>
          <div class="item-process">
            <div class="item-process-bar" id="commitProcess" style="width: 0px;"></div>
          </div>
        </li>
        <li class="menu-item menu-item-fontsize">
          <span class="item-icon fontsize-minus">－</span>
          <span class="item-label">字号</span>
          <span class="item-icon fontsize-plus">＋</span>
        </li>

      </ul>
    </div>
    <button class="btn btn-primary btn-nav" id="endExamBtn">提交</button>
  </div>
</template>
<script>
  export default {
    name: 'Side',
  }
</script>
