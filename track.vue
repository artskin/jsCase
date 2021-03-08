<template>
<el-dialog
  class="dialog-locus"
  :title="$t('records.titleLocus')"
  :visible.sync="visible"
  width="97%"
  top="8vh"
  v-if="visible"
  :append-to-body="true"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  @close="closeLocus"
  >
  <div class="dialog-ctx" v-loading="isLoad">
    <div class="locus-header">
      <el-form :inline="true" :model="formFilter" class="form-inline">
        <el-form-item :label="$t('pedestrian.similarity')">
          <el-select
            v-model="formFilter.threshold"
            size="small"
            style="width:90px"
            default-first-option
            @change="onThresholdChanged"
            @clear="clearDate"
            :placeholder="$t('pedestrian.similarity')">
            <el-option
              v-for="(item,itemIndex) in thresholdOptions"
              :key="itemIndex"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('records.contTime')">
          <el-date-picker
            v-model="formFilter.timeRange"
            size="small"
            type="datetimerange"
            @change="onDateChanged"
            range-separator="-"
            :default-time="['00:00:00', '00:00:00']"
            :start-placeholder="$t('log.textboxTimeSet')"
            :end-placeholder="$t('log.textboxTimeSet')">
          </el-date-picker>
        </el-form-item>
        <el-form-item>

          <!-- <el-button type="primary">{{$t("records.titleFootfall")}}</el-button> -->
          <el-popover
            ref="filterPopover"
            placement="bottom"
            width="955"
            popper-class="exact-filter-dialog"
            trigger="manual"
            v-model="filterDialogVisible"
            >
            <div v-if="isAccurateFiletr">
              <h3>{{$t('records.accurateFilter')}}</h3>
              <div class="handle-btn">
                <el-button type="text" @click="clearFilter">{{$t('records.buttonCancel')}}</el-button>
                <el-button type="text" @click="filterOK"><strong>{{$t('records.buttonOK')}}</strong></el-button>
              </div>
              <div class="exact-filter-body" v-if="pedestrianMap && pedestrianMap.length >0">
                <template v-for="(item,index) in pedestrianMap">
                  <el-checkbox class="month-title" :indeterminate="item.isIndeterminate" v-model="item.checkAll" @change="handleCheckAllChange(item,item.checkAll)" :key="index">{{item.month}}</el-checkbox>
                  <el-checkbox-group :key="item.id" v-model="item.checkedList" @change="handleCheckedImagesChange(item,item.checkedList,index)">
                    <el-checkbox v-for="(im,key) in item.list" :key="key" :label="im.objectId">
                      <el-image :src="processImgurl(im.imgUrl)" fit="cover">
                        <div slot="error" class="image-error">
                          <i class="iconfont icon-img_error"></i><br>
                          {{$t('el.image.error')}}
                        </div>
                      </el-image>
                      <span class="label">{{toPercent(im.score)}}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
              </div>
              <div v-else class="exact-filter-body" style="text-align:center;color:#ccc;line-height:600px">
                {{$t('liveservice.contNoData')}}
              </div>
            </div>
            <el-button slot="reference" style="color:#2A5AF5" type="text" @click="accurateFiletr">{{$t("records.accurateFilter")}}</el-button>
          </el-popover>
        </el-form-item>
      </el-form>
      <div class="export">
        <el-button
          @click="showExportLocusDialog"
          type="primary"
          v-if="isExport"
          icon="el-icon-upload2"
        >{{$t("records.exportFootfall")}}
        </el-button>
      </div>
    </div>
    <div class="locus-body" v-bind:class="{ isCenter: isCenter }"  v-if="hasData">
      <div class="locus-bigmap" ref="mapOuter" @mousedown ="userMouseDown" @mouseup="userMouseUp" @mousemove="userMouseMove" @mouseleave="userMouseLeave">
        <div ref="mapUl" class="ul">
          <div class="svg-layer">
            <svg ref="svglayer" :width="svgWidth" height="100%" :viewBox="'0 0 '+svgWidth+' 400'" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="f1" x="0" y="0" width="200%" height="200%">
                  <feOffset result="offOut" in="SourceGraphic" dx="1" dy="1" />
                  <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .5 0" />
                  <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="1" />
                  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                </filter>
              </defs>
              <!-- <path v-show="isPathShow" class="svg-path" ref="svgPath" filter="url(#f1)" fill="none" stroke="#e24533" strokeMiterLimit="10" strokeDashOffset="988.01"></path> -->
              <g ref="svgGroup" v-if="isPathShow" class="svg-path" fill="none" stroke="#e24533">
                <!-- <path fill="none" stroke="#ff9966" strokeMiterLimit="10" strokeDashOffset="988.01" style="stroke-width: 1;"></path>
                <path fill="none" stroke-dasharray="5,5" stroke="#ff9966" style="stroke-width: 1;"></path> -->
                <polyline v-for="item in mapList" :points="item.deviceCoords" :key="item.id"/>
                <polyline class="cross-path" v-for="(item,index) in mapList" :points="item.crossMapCoords" fill="none" stroke="#707070" :key="index" stroke-dasharray="5,5"/>
              </g>
              <circle v-show="isPathShow && showRunner" class="runer" ref="runer" r="10" :style="startPos"></circle>
            </svg>
          </div>
          <div class="li" v-for="(item,index) in mapList" :key="item.index" :data-id="index">
            <div class="maplayer">
              <img class="map-img" :src="item.mapUrl" style="scale" alt="" @load="setSvgWidth" :width="item.scaleWidth - 16">
              <div class="device-list" v-if="!isLoad && item.deviceInfos && item.deviceInfos.length > 0"  :style='"transform: scale("+item.scale+")"'>

                <el-popover v-for="(n,indexN) in item.deviceInfos" placement="top" width="155"
                :data-offset="n.points" :key="n.index" class="device-place"
                :style="n.devicePos"
                :slot-scope="n"
                v-on:mouseenter.native="n.visible = true"
                popper-class="device-popover"
                v-model="n.visible"
                :ref="'popover-' + index+''+ n.deviceId"
                >
                  <div class="popcon" v-if="n.images && n.images.length >0">
                    <img height="62" :src="processImgurl(n.images[0].smallImageUrl)" :alt="n.visible" />
                    <p class="device-pop-info" v-if="n.images[0].dateTime" :title="n.deviceId+':'+n.deviceName">
                      {{n.images[0].dateTime.split(" ")[0]}}<br>
                      <strong>{{n.images[0].dateTime.split(" ")[1]}}</strong>
                      <br>
                      <el-button type="text" @click="openPic(n)" size="mini">�鿴��ͼ <i class="el-icon-view"></i></el-button>
                    </p>

                    <!-- <el-carousel class="small-carousel" height="60px" width="140px" direction="vertical" :autoplay="false">
                      <el-carousel-item v-for="m in n.images" :key="m.index">
                        <img :src="processImgurl(m.smallImageUrl)" />
                        <label>{{m.dateTime}}</label>
                      </el-carousel-item>
                    </el-carousel> -->
                    <!-- <p>{{n.deviceName}}</p> -->
                  </div>
                  <i class="icon-torus" :style="n.deviceStyle" @click="openDevicePopover(n,indexN,index)" :key="n.index" slot="reference"></i>
                </el-popover>
              </div>
            </div>
            <div class="floor-name">
              {{item.floorName}}
            </div>
          </div>

        </div>

      </div>
      <div class="bigPic" v-if="isShowPic">
        <h4>{{$t('liveservice.validateDeviceName')}}��{{currentObj.deviceName}}</h4>
        <i class="el-icon-close" @click="closePic"></i>
        <!-- <el-carousel ref="bigCard" :loop="false" :interval="3000" height="100%" :autoplay="true" trigger="click" indicator-position="none" arrow="always" @change="onPicChanged">
          <el-carousel-item v-for="item in currentObj.snapshots" :key="item.index" @click="handlePicItem">
            <el-image :src="processImgurl(item.bigImageUrl)" :data-href="item.bigImageUrl" fit="cover">
              <div slot="placeholder" class="image-error">
                <i class="iconfont el-icon-loading"></i><br>
              </div>
              <div slot="error" class="image-error">
                <i class="iconfont icon-img_error"></i><br>
                {{$t('el.image.error')}}
              </div>
            </el-image>
            <span class="shot-time">{{item.dateTime}}</span>
          </el-carousel-item>
        </el-carousel> -->
        <carousel ref="bigCard" class="bigCard"
          :per-page="1"
          :paginationEnabled="false"
          :navigationEnabled="true"
          :autoplay="true"
          :autoplayTimeout="3000"
          @navigation-click="bigCardClick"
          navigationPrevLabel=""
          navigationNextLabel="">
          <slide v-for="(item, index) in currentObj.images" :key="index">
              <!-- <div v-if="index >= currentIndex - 1 && index <= currentIndex + 1" ></div> -->
              <!-- <img v-bind:src="item" > -->
              <el-image :src="processImgurl(item.bigImageUrl)" :data-href="item.bigImageUrl" fit="cover">
                <div slot="placeholder" class="image-error"><i class="iconfont el-icon-loading"></i><br></div>
                <div slot="error" class="image-error"><i class="iconfont icon-img_error"></i><br>{{$t('el.image.error')}}</div>
              </el-image>
            <div class="shot-time">
              <span>{{$t("records.snapshotBigPic")}}��{{index+1}}/{{currentObj.images.length}} </span>
              <em v-if="item.dateTime">{{$t("records.snapshotTime")}}��{{item.dateTime}}</em>
              </div>
          </slide>
        </carousel>
      </div>
      <div class="player">
        <i v-bind:class="playerClass" @click="playFn"></i>
      </div>
    </div>
    <div class="locus-footer"  v-if="hasData">
      <div class="small-thum">
        <h4>{{$t("records.snapshotSmallPic")}}</h4>
        <!-- <img :src="imgData" alt=""> -->
        <el-image :src="imgData" fit="contain">
          <div slot="placeholder" class="image-error"><i class="iconfont el-icon-loading"></i><br></div>
          <div slot="error" class="image-error"><i class="iconfont icon-img_error"></i><br>{{$t('el.image.error')}}</div>
        </el-image>
      </div>
      <div class="locus-thum">
        <h4>{{$t("records.searchImg")}}</h4>
        <carousel
          ref="smallMap"
          :perPage="7"
          :navigationEnabled="true"
          :paginationEnabled="false"
          navigationPrevLabel=""
          navigationNextLabel=""
          :navigationClickTargetSize="4"
          @pageChange="pageChange"
        >
          <slide v-for="(item,index) in mapList" :key="item.index" @slideclick="slideClick(item,index)">
            <div class="outer">
              <el-image :src="item.mapUrl" fit="cover">
                <div slot="error" class="image-error">
                  <i class="iconfont icon-img_error"></i><br>
                  {{$t('el.image.error')}}
                </div>
              </el-image>
              <div class="title">
                <strong>{{item.floorName}}</strong>
                <span v-if="item.deviceInfos[0].images && item.deviceInfos[0].images.length>0">{{(item.deviceInfos[0].images[0].dateTime).substring(5)}}</span>
              </div>
            </div>
          </slide>
        </carousel>
      </div>
    </div>
    <div v-else class="dialog-nodata">
      <p>{{$t('liveservice.contNoData')}}</p>
    </div>
  </div>
</el-dialog>

</template>

<script lang="ts">
import { Component, Vue, Watch, Emit ,Prop} from 'vue-property-decorator';
import anime from 'animejs/lib/anime.es.js';
// console.log(anime)
import {similarList} from '@/utils/constants';
import { processImgurl } from '@/utils/image';
import request from '@/api/history-record';
import { Carousel, Slide } from 'vue-carousel';
import { toPercent } from '@/utils/small-tool';
//import BatchExport from '../component/batch-export.vue';
import { Cache } from '@/utils/cache';
let mockMapData = {
  mapVos:[
    {
      mapUrl: "/senseguard-map-management/api/v1/floor/check/5",
      floorName:"������Ч����ʾ",
      width: 1920,
      height: 899,
      deviceInfos:[
        {
          deviceId: 1,
          deviceName: "mock�豸0",
          points:[200, 96],
          images:[]
        },
        {
          deviceId: 12,
          deviceName: "mock�豸1",
          points:[408, 62],
          images:[]
        },
        {
          deviceId: 102,
          deviceName: "�豸02",
          points:[300,500],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 103,
          deviceName: "�豸03",
          points:[600,200],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 104,
          deviceName: "�豸04",
          points:[900,700],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        }
      ]
    },
    {
      mapUrl: "/senseguard-map-management/api/v1/floor/check/5",
      floorName:"������Ч����ʾ",
      width: 874,
      height: 698,
      deviceInfos:[
        {
          deviceId: 103,
          deviceName: "�豸03",
          points:[600,300],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 104,
          deviceName: "�豸04",
          points:[400,800],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[700,500],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[700,500],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[800,200],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[900,900],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[200,900],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        },
        {
          deviceId: 105,
          deviceName: "�豸05",
          points:[1400,400],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        }
      ]
    },
    {
      mapUrl: "/images/floor03.png",
      floorName:"������Ч����ʾ",
      width: 1920,
      height: 1080,
      deviceInfos:[
        {
          deviceId: 106,
          deviceName: "mock�豸106",
          points:[200,500],
          images:[
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            },
            {
              bigImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_panoramic/20200519-103105a155-b327d3cbc002c4-00000000-0002c3ca",
              dateTime: "2020-05-19 18:30:58",
              smallImageUrl: "senseguard-oauth2/api/v1/osg/images/video_pedestrian_cropped/20200519-103105a54-b327d463de20d1-00000000-00001793",
            }
          ]
        }
      ]
    }
  ]
}
const reducer = (accumulator, currentValue) => accumulator + currentValue;
@Component({
  components:{
    Carousel,
    Slide,
  }
})
export default class LocusAnalysis extends Vue {
  //@Prop({default:false}) locusVisible!:boolean;
  @Prop({default:true}) locusVisible!:boolean;
  @Prop({default:''}) imgCropData!:string;
  @Prop({default:''}) imgData!:string;
  @Prop({default:''}) parentParams!:any;
  @Prop({default:''}) locusType!:string;

  get currentIndex() {
    return this.$refs.bigCard ? this.$refs.bigCard.currentPage : 0;
  }
  @Watch('currentIndex')
  bigCardCurrentChanged(newVal,oldVal){
    console.log(newVal,oldVal)
  }
  devicePopShow = false
  hasData = false
  isExport = false
  isPathShow = false
  dialogTrigerNumber = new Date().getTime();
  checkAll = true
  isIndeterminate = false
  filterDialogVisible = false
  checkedImgMap = new Map()
  handleCheckAllChange(data,isCheck){
    //console.log(data,isCheck)
    let dayTotal:Array<string> = []
    if(isCheck){
      data.list.map((item)=>{
        dayTotal.push(item.objectId)
      })
      data.checkedList = dayTotal
    }else{
      data.checkedList = []
    }
    data.isIndeterminate = false
    this.checkedImgMap.set(data.month,data.checkedList)

    if(this.checkedImgMap.size > 0){
      this.objectIds = []
      this.checkedImgMap.forEach((value)=>{
        this.objectIds.push(...value)
      })
    }
  }
  handleCheckedImagesChange(groupData,checkedList,index) {
    // console.log(groupData)
    let checkedCount = checkedList.length;
    groupData.checkAll = checkedCount === groupData.list.length;
    groupData.isIndeterminate = checkedCount > 0 && checkedCount < groupData.list.length;

    this.checkedImgMap.set(groupData.month,groupData.checkedList)
    if(this.checkedImgMap.size > 0){
      this.objectIds = []
      this.checkedImgMap.forEach((value)=>{
        this.objectIds.push(...value)
      })
    }
  }
  // handleClickImagesChange(item,index){
  //   console.log(item,index)
  // }
  bigCardClick(e){
    //console.log(e)
    this.handlePicItem()
  }
  clearFilter(){
    this.checkAll = false;
    //this.checkedImgMap.clear();
    this.filterDialogVisible = false
    this.isAccurateFiletr = false
  }
  closeLocus(){
    this.$emit("closeLous")
  }
  toPercent = toPercent
  visible = true
  isPopoverVisible = false;
  dialogBigPicVisible = true;
  currentObj = {
    deviceName:'',
    images:[{
      bigImageUrl:"",
      smallImageUrl:""
    }]
  }
  currentSmallSnapshots=""
  formFilter = {
    //timeRange:[new Date(new Date().toLocaleDateString()),new Date()],
    timeRange:['',''],
    //timeRange:['2020-06-01T12:51:06.549Z','2020-07-14T16:00:00.000Z'],
    threshold:''
  }

  isLoad = true
  imgdata={
    base64:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAABUCAYAAADjyTUjAAAeUklEQVRoQ0WaCbSdZXnvf+837nk6Z58hJyMZSYyCEGaSQAwIqIgKlSLK6LBKbXFoq6AiRbFqbwfvbbuqCAJSrFZBK6AMMUAgISQh83QynyRn3vPwje9d7xt777fWXnuf5OzzPe8z/J//838+sSqflpcvfy83rL4Ks9qgHMWY3QDhWMQCgiDAEgZGIOlM1yimMhgSIikIDQiTFi0j5lS9yu7ONJ1z5iJm9TF84BCPP/lTGlMBCFi8ZCHf+vbf8eEP3kCl1sSxEjzy48cRdy5aKC9fdi6f/MhNjO0/QKrjURkbxRcx6XyOEIHf6WKGMU4EOTOB9ENcxyG2DNxigZHqJPtOH6c1mGfpHTfiDxT4wT/+gD37DrDhlc2o64aPfZgHH3qYxfOX0Oz4uKbDw9/9X4gX7rlH9qdyLBqaw8Sx4zRHx4lDjzjpkshn9U3a7TaGF5LGpmgnEcpDIbS9LkYmScuImPK7GPNnMOvGq/jd3m189av3U5mu4XUlxWKBW2+9jfvv+zqJRIYwkNiWw/e/98+IH6+9WmYMGyOM9clsyyCVz2Dk0li5NCLl0vG60A0oWWmmD58gGYArLeI4xki5kHQ4WavQ6ElzanaOreMn+MXT/w2RPjzlGb184Qtf5guf/yvqzTaGsJFS8Pff/0fELz/wQVlMZhAxOKkknSiiI2JO1Kc43a7hWRDGES42g6k8s5MFiiRIKA/UGkzVq2R7e/FNMOYN8MBzT5NZMo9isYjjuIQBHDt2ghs/9nHuvvsz2FYSy4BmK+Lv//4fEK/dfIsUfohhOXimoH/RfLYdGebl7W+x5fB+RjsQSygmYDCdZc3S97J88CyW9c/GkYK9+/aRyGS0AanFc/j5kR00sw69vb2AQa3W4OWX1rH07OVcffV1fPQjN5JKZZmarPDII48itn7yVtmoNMiXe2hIyWgc8ereHWw9cZiT3Ron2xBEkLYh5cHChMPyvtmsWnoulyw/l+nJCm4ywfZ9exjB44fvrCfqK5BKpRgbm6BY6NGemDd3Pvl8D+eecx7ZbI5OO+CNN95AbLn5ZinDmNkLz2IaySPPv8Are7dTc8Cd2cspr0knDsiYDnKyzVwjTaEtWV6exfWr1+IIm4GBATZt28Ke2ji/PLaTeZecz7Jlywj8SIcinc5oY3bt3Mfp02M4tovvx1SrVcT6a66VqXSGgXmzOeV1+PmmN/nVpq00HEjMzXO8UtOJlOvJI2tt0tMBM0WSVfOXc9NV1+FN18mnM2zdto0jQYP//fY64p4UK1euZs2aNcyeNYeR06Ps2LaD8clpNm18G88LqNVqGIaF2HDt9bIdBUSuRVTK8ustb7L+wGG6KWinLMb9EDIOpuEg2iFFz6TYgbVLz+NG5YFOSH10jOZ0lTkXncN31j/D8ajNihUXsmfPXiYnphmaOZf+8gBnLVhAvdbkzTffZNeuXXS7XcSem2+XrcDDcwz8fILfbH2T32/fTTsBspRhpN0kDNFoZtlZnLrPkJ3hfWefy9XvWUEmEPQn03RqNaJylh2JLqkls5kzZx7f/94/sHHTFubPX8iD33yIVatWc+jwUQ4cGGbdupd58cUXEQc/cbds+l06pqSbdnnj0B5e3rWNqgFeLsV4GNCSkk7LAy+mRyR1Kd5w0SquXP5eOqcmSUaSsRPHOdqtcLhkcOWtN/Gu95zDV79yP5s2vc1Z8xbw+BP/Qbnch2Xb2DYcOT7Ks88+izhw0+2yHfm0jZh20mbvxChHmjUmYp8dp04wPD2JyGXxA4nf6DAzU8Spdrlx5VpuWPk+xocP052u0K5W8XIOW6lw2U0fYtbMOfzZ5/+CPbsPsXbtGn7xX8+SyaapVJqkMhltxFSlhTj4sTtkl0h7oOPaHKpO42VT2hhVjm/s2001jJCYZNw0iW5EWK9x48Vrue3DH6MzPolXq1ObmsTP2vx83yau//QnWbv2Kr79re/ws5//ig9+8EPc/7VvUij2UCoVqTU6GJZNMmUhdl/3pzIwoaVelsk0UBERoq+HaRFyqDLFrqNH2X/oMGZsYHUiZL3OinlLWHvBxRTdJPOGhmjXa4wHDTZWj7H6hmu45NKVfOfh7/JvP3yMD99wPX/70MPMm7+QIIgwTJtIGsRIxK5rb5aBIWgYkpoA0dvDoco07YSNn0/RcEz2nRhh87Z38LsBGWnSnaxihh2KuMzIF/jgNdcwNDiAXUqzfeooF7//ChYvXsrD3/47HnviSS659HJ++tTP6Cn3Mzo+Qam3D8sU6Nw+etOnpWca1KTPtATR18/JbovDlWneOryPw9UK1TCk3u1QKvTgVxq4IVjtLlI1Kbq8e8Eysrk0pRm9FOYPcP2f3siihYt54IEH+dEjj1LqLbNp89s4bppcroAXxTRbbYq5DOLYn35OTnc7VOKAsJCnkczQziR5e/gAz23awLFmnUSphHBdQi+knC0yeugoWdMhaZq06xU6cZusm2bJ8sW8+8J3s3rtFRqKH3/ipzz11C8olPLcccdd3PCRjzFj1mySqQxBGHHy5GnElms/LjvCYFoGTFkGmYWL2T56it9teoPNwwcgmcDq78dykyiKpHhBt9rADiUZxyGdSTI2NooXdDj7XUsYmlFi9pwhnESC3bv3sGnTJvxOQCqXYWj2HB2OwcEhhGFqPBAvr/6QlJkUfirJqIwYMUwO1qrsPT3CVODrf68FAc22hyEc4mqThJvShhhxRKGQY2T0JMiQj970EbZtfp3KxGlarRau6yKEoN5sKG4Hpo2VSFAs9mCYFuPjk4iXr/6odEol7IEyU7bFptOjVBybtm1iFov4CZeDJ0+x/8ARWo0unak6eIF+mUJQ7CnQ6nZI5FLceMOHGDt2gG1vbeD4wYNgCHI9PZimqcmLbdtMTU1hmhZRDDKKEK/fdLsUuQwt1+J4GPLcrj1MGtAQgsxAPzOXvgsrk2V8okZ1qs7Y0ZMc3b4bKnXIZCn29WAlXXxChvrLXPCuhezcuont298h9DoUSwWSySTtdpN6vU5Gg5CNgYnneYjNd94jxzod3jq0j52TE7xy6DBtlSRSQiZNaclS5i5cSr7QQ9LOQjdk95Yd1CeqdDodIhlqAwIhSSdMlp81k5Ej+zl64AB4LZLlHso9JWr1CrVTJ0n3KH7g4FgucQxi4133yO1Hj/DM6+vZ320Sl4eQPSVNTqabTTBUX85iF/roK/Xz3rPP0T2hXW0yPDxMpVolIETaJvPnz6THNaiMn+DQoUO0x05BytWkNAo96pNjpPMFoijCNh1SiSTi5ds+Kzfs3s1zm9+g7ri4c8+i7tjo0vQ8wIZABSwB2RLnLHoPc89aRCuMOHjoGK7l0Op4jFemWLR4PjlHELQrjJ0+xciJI8TtOom0SzbhICMPr9si9gMMBJZlIX79qc/J4YlJfvPqeo63W1gzBunYBp6UtMNQHZZImkQKr7uScs8sinMX0pk5wFQ3RFRiUnYGJ5lBCmjWJmnWpiiXMiRMybH9O6E2iuWaxH4DI/TJJBwUDgoZI5669bNyx5HD/O7NjYxHHkapB882CGSsESvERBg2RBaxb2HGSbILFlFbPAdfujAhMYIEViqLaVl02g3w25R7c6TVf48ME9QnoFPFHxnGSNk4pjpViKl6zuN3/pncefQYr2zcyEirDoUSoWMTCfDjkEhYCNPBiG3iwCZoQWHJUjrLFtEWScTpEDoGuGkM28KyDGTUJZswMaIOcXuaUtrACpqcHN5N/fgwZtIi7bqkXQvxsXmL5PDoKCOdOpabJ0omIJFQ9IeQmCAWxFgQmUS+gRklmHHeCvzlSxjtSuLjHm6YIHaSeGFELp/GtmLUt1u1ceywxez+PImow8ih3RzftQ03oYYNj9DvIC4fmiHb0uTIqVOQTOMbNnYqjZVMai+ocoxiQ/0+kS+woiQLV6/BW7aYQ5N15ImA3lQZ6WSYqtWxEzDQXyKXdGlOn8avTZA0A/zKKCeG90LlNMlcCkeEyMBD/PdPHpEHT5zkx489waGRUaRwSGSyuJkU0jQJ1CSsQuYLAl/gNwWLV12Bt/xsjkw2MU5LBvJDCDfLRHWaUPjMmjlITzZBszJBY/wEXmMKvzZ+5jU2gmlLXCMkm3QQnca4/NGjT/Lgt75Do+Xh2GmSqSxWKqGqGz+WRJIzSRiYdGoxQ+dfoA2YDmzsSYO8VSKyUzQ6XWIjoLecI+PadBsVmpOnCOqT5GxlaJJDu7dQOT4MzQrpch5x5Ph++fhTT/PgQ98hjgxKmT7cZBJhW3SigE4QagNErCrBRgY2+UXL8JYvw0/2kJi2oGMRSIfQMIitgHwhRdp1kF6bbmWcTnWcnpTJkjkDbH71ZaaO7iOdslmz+mJExavKF373Evfc83mmTk4we9ZiIinxZahLUeVALAVRaCBDh6AN6flLyK29koZM0T3cpJDoJzIS1LtdpBUijBBT1XjYxfQ6mFGbJD5Jw6c1eZra+HFu/NDVXLP2MsSXH/yKfOWldWx5822yhV7yqQIyFgTE+MSat6lKiFRGRg6y6xD3D5Ffs4ooM0B4vIsTZwlkAk/GRKZSRALMKFCJg/DbOLFH2oi0AYZX5+iBnay++Fxuu+WjiMvff6WsVxts37YdIS1mlIf0VKviHxgRYay8IHR4ZOwg/CRerkDqyitIDp5FfCIkbJp4kYNwHUI8lTkYapoJPYwoQPXKpAhJCZ9y3ubIvndw6HDVFRcgfvjoj+WuXXv4p3/6gcb1Uq4XhCBS+g/RGSyQIGOF3gn8hkFU7Cd79VrcgbMIjnraAD92NdkI4g4oAyKJiNS7hyWVER627DKjmKBdP82BnW+RtH3E+nV/kE8++RQ/euTHDPT2a/djGlqgCkWEL5URQrMhQyRpTnRhaB6l91+NyM+gc7iN6KaIjBRYimh0MQi0qGASYoQBRtTFCNuYUYtyzsaSTXa9tQ5qpxDfuv8b8rXXNrBu/XrymYLu1bEpzoAQEX4cEQuBbStlI83UWAcGZ9Pz/vcTZwfoHulgeGltgMINBcNIX9M1haG2jOCPBhhhk8Vz+6lOHmPv5nXQPI14+G++Jg8fPspLL75CNwhwEwltQChiurGvPYBp4TopXCdHoxLRSGRJrL6C9OAC5IgkaFh0YgfbUSSjDaFPHAWIOMIREluEOgymbLNs8Uwqo4c4vO9tqqcPIH75w5/IiYkJfvDP/4das0UyldIGqArwYp+ugkHbwknmcd08Xsdkoh1hXXQJAwvOQU6Z1Cd9Wp5FIpMmjjuEfosw8EAZYMYkHYErImzh0ZOzyTghYWuCfbveQvzVbXdKRRqRBlIYdAKf2DBpez7rN73B8JFjFAeHcHMlAhLYyR5GJ5sk5i9n3tLzqFdgaqoDZkqjpsIBqRJRlaGIcBywjQgz7iDCNrLbwI67TB09yLyzhhD3fvwWqURH07A0i03m8ziptP5jr7z6Gpt37MZMZzQta8cOyUI/tXpIef67mbvwHCaqIaNTDW2AGmEDlYDCByPCtg2STowlVB60kUGTtDprp87Jwwe46LxzEV/4+C3SNkwMwyRWkG+aFMt92KkE6zZsYMNbWwktB2mn6YoETrYXjySzF57L4NylTFS6jE61QCSRlkEkuggjwrIFrqKTNpgyIPQbRH4DV6qq8Dh9ZJjLLjwf8dVbb1dYi4FBbMB4rULP4KCO54aNm9mweQvSURwhS2gkiN0CRrLIrAXLKQ8uYKoRMFX1iKWNFgCtAGEEGKbENqU+vYy7+uaR30JBlRn7jB4/yppLL0F87dY7pGEY2IZFbAjdgDKlAsJ2WPfa62zc+g6Gm0S6KTzh4MVJ3HwffTMXkO2diR85NBUxkRaRkkbFGSSURGfwQCpI7hKr8ow6ZJM2nhJATo5wzVVXIr5+y+3SMkw9rSj4NVIObi6tO+DL619l07btmIkU0k3jxRY+Dla6h0S+n3Shn1S2F8PK4AUxXtDFMLrE0iOOQ2TkI6WnjTBiXwO8KUL8doPp8VHOXf4uxAO33KFzQKlQ3SjAtyBVzCFMkz+8/jqbt27HSKa1FzxsFKhKJ00kUjiZEkOzFpAr9tPuBjRbNUTc0h6I4oA47BIG6vQeQvqaCSsWpH6uT02ScB3ENz9xp3QtG5WBrbBL15Dk+4rYbpL1Gzaw6e0tYLkIN4GvDVBRdAm6IaRLLFiynL7B2bQ6XarVabqtSd0LokglXhvfa+MHqgJUnvjkc2m8dovO5IQGLG2AEiKVWO3FAWY2RSvsUO4f5OjICOvWv8q4UjStBJHhEJkOoVLKhYvppnFTedKZAolUGts2CbwqI8ePkM2kmDx1nEQmSddrQnUapzeP32qgdL9kPqONEA/d/hkppURIxQEiPUop8jMwOMSeffv59W+fY6paw80ofMjgRUo7VtFUDcvFshNYbgLTSiAU2hkRkxMnSaeSNCbHwRYIItJJm1TSQd2r3pgm9BXs24hv3Ha3lHGs+h3SVJzDxEhYDAzNZPuOnfz6N79lql4nmc4jLAvDTmp+EEYqokpoOoOgUn1Zyfq2xOs0cR0Lr1GFOCRVyHDxhefjdZucf/75CHFGJzYtgbjv9rukDCMNRIZjE7sm2Cblvj527dnDC79/hXqjhbBs2p6nDVEUTd0cYSINoX8O1Kirh/4zwoVKqshra0iet2Aen/30HVSmx1mx4nzmzJlFEHocPX4Ecf+nPyvDMMSybGyVlUlXA0q5XGb7zt0899wL1OpNTLV8UCO7Yali1R1SqRwKQzBMgijSIkTgeZjCIPAU+HQQMuDSSy7kmw/cz6QKSRwwONiP6Zhs3/EO4iuf+YxU47LqBXbC1TsiBakD/TPYtWcvv/rls0xUpnDdFMl0GkOc2aYJpXRbCsItPZSqvxGFMWEYazISKf2520I59MorVvK1+/6aamWSRMIhCDu02y127t6F+NJdd0lluQIiRxlgWnQDn1mz5jA6PsaLv3+ZYyMnCMJYY0MykdYGqJtKIRAqDFKivKgFByxtjJARzUZVDx/KA3fddiuNmlLO+8nlMoyOnWbH7h2IL33ubqkWSKolK0KRzmaYqtSYO3cuwrTYuWM3h44e48TISSYmp7XwpLiOql1liLqUAdoDUYRlukRBgG1b1KrT5NIpzjv33Vx3zVrq1QrTlQmuXLOSSmWKre9sRTz8wFelWk4qyqkpuB/pWLtOEttN0G51yeQLNFtdfvFfv2J4+DCFUolkOqVDpjR/pYIpsUFdftcj6dg6N5QmlM1kWL16Jeed+x5s06TRrDFz5oBuVip9xEPf+IpUGam2o+oyDVeLRzFn4tvp+vSUB7SrX3jxJTZv3kKmUCCbzWJYFo1Wk0ajcSYPwgDHMjGFpFqpa8+odc7NN9/MqpWX8Yc/vKIFq95yUXfKnt4C4oH7vqyrQNekEJjS1tmMYWNZDu2OKr2cju8fXnudt956Gzedore3jGnb2gDf94lkROD7yEhVlEGr3tJhVUvPq666ik/ccjOvvbaenp4eMtkkrm2yYMFcxP1/fa+uAss2dIarO+l309RhaHcCXYIKpbbt2Mn69a/hRSGDgzOwXVcboE4aRIGubRFJfL+La7k6LOOnTuGkUtx040cpFvPaI1KNL50Ws2YNIu77m3t1L7DNMzFU4qPCkY7vYyncjwSJdIZSsczY5BTPPPNrjo6coK+vX8uxFUUKlWTtKR4Q4Zo2kxNj5AsF7QGv7WnPzhgaYM2aKzj3PefQatc5ceLYGSj++n1/JYWQKE6gy8n3dQJ1PLXGdQkiVX4uvT1lukGoPfDqG29SLJZIZ7M02o0zN/J9EkmHytQknWqNUn+/TtBMMqM9MTU9waWXXsq1778ax1WK6QRh1P0fA4S+aRxGBF5HDyeKYDh2Ai8IaXdDioUS0jA5dOgIT/3nz0ins5TKvbS7Z34/jAO9LZ0YG0XR/EwqrctSr+aEoFmrMzDYxzXXXM2iRQtJKkBSCsl9f/PFM+1YuT6OSVim/lxrtHR/ULsiBW4zh+aQLRR1Gf7gX/8F23a1Aa1OW58wiHwGBwfp6+3Ra7mg0STX26sNUIY4pqUF7JWrLuPCC1fQUyrS6bQQX/7SX0oFLu1GUy+V1Lb5zIkUvCpos/HDWANMvtSjb/zEfzzF1q1byRbyGrjUDbq+R7PZZP68ucydN5uXfveSLlO1oFChTboJXa5nL17IypWXsXDhAlrtBuIbX/+qVOKxMiCdSdFpNUk46kTKI1Lvd9TuUp0kWyjosDzxH0+zbds2csUCmVxWG+AFPs1mndWrLueiiy7imV/9ml1btpAu9WoPqf6v3lX2r1q1iksuuYhyuRfx4De/oScjZV064WoK5ViGvqkQBpba84YKbgWpbFbvCp54+ine2bqdzB89oELX9TvaxeVyDx/4wAf0evb555+nMlXV2xPlZWXA5PgEfX29Ghkvv/wyxAPf+JpUMVdfTtiW7ueK3gdqvhcmjpvSIVBA5KbS9JT6+MlTT/L25q2kc1kNyQrIFCNWIcDvcs4FF+gVzc6dO/nhv/67Xlb0zZqlPZVwXKanpxnsL3P99R9EPPDA17UBaiOmpFNlgK2GU9X9hImbSOvPUSQ1HsydM59Hn3ycjRs3ajFLre7PGKBC0NRT8cCMAb710LdJJtM8+OBD7Nu3j4G+Qb1Jb9SqVCoVenqKrL1qDeK++74ilWvUFK7UbMXfHEt5QLU6FQJHh0B9Tmay2oBHHn+MDRs2aCBSBmgiEoU6qwO/q5vVnXfcxerVq/nNb57n9ddf5+D+YYaGhvA67TP4kEmxYsUKxL333itVg1CJ6HstbCFxbUEYG9rtivX8/yQsMtA/xI9+8uj/MyCVSf+RFSkIVhOR8lbEJRdfym233cYbb7ylN+XrX1qn2bAKhaJrijGpshV//ud/JlVnS6dSdDpNBB6urTabkiiUGnzUUy+m5VAolhkYmMEjj57xgKLiuVxOl61qTCoU7U6TsZETzJq/iC9+8Ys8/7vfk06nOXrkuK4c07EplQp0Wi29xhGf++xdsq+vrBFQWBLbjfF9j0hpPKbq6yoxDS3ZW1ZCJ6Ha972zZSfPv/ACMwZmUyr1ah6oUHGqMkmlUUcx7Vs+9Un+/C8+z389+wyPPfYYE4oTSkm+XMZyzjxJI+75y7+QauupJhnbMXQc1YChLt2mMfUJVUJGQUwh34PrJtm/d5h//7cfknSzhEFEIVfEsEyC2Kdar2hy84lPfYJ7v/gFnn/x9/zs508zWZnm5OlTClR0QirDxafve0A3I9MUOKZDOdtDq9bSOO3qsoyIfE/z/JxCPT9gxowhhg8e5qdPPE2n3WVyclovIxXh9IMWk5UxHMfm9rvu5K677+a3z/2GdetfwXIcnnv+v/Wya/bs2QyU+xCf+96TUhhSMxV12qB+5ikpESlxLsCQvhYcRexhxIFutXPnzqHRaLL5rS16+bh7z14NucmEi21FVKpTpNNJ/uTmj+ta/+3zz3HgwH5mzRrSoWi3GsyYMYNCPotYcMP3pZt0NFrJKMY1XGYPDpFN2bRrExhxi3zKwm9PMXbyGP29OVzX0clXqVXZv+8Ar7+5EV+t5Q0DoYyVUqPeigsv4AMfuJbjIyc00OVzGf3UxOHhg5p3FHI5RGntv0iVEMISRHGsIbTbbeMYATlXIr0KsltjsJxiwZx+hgZ6eO21dRpaFQ8cOTXOdK1Ou9WCakM/8iWKvboB9faVue6668jkzpATRVKnJyd59dVXqR46DNkcYt6fPCuDUEnyCmtt3N48R48cAL9JTzFJ2JwgbI1x9eoLufNTN2ER8NRPH9cuVAPMyVNjLDx7KcJwmJqs8sKzL9LfO1NnuWLV6gmaQ0eO6lxRytvcOWexd+9+hrdt15qEWHrrL6VqpUqgcksFjtWrJAppMpakUx2lWz3NWTML3Pzha/nI+xby4qs72Lx5o2a6YSxZ9+oGzr/oUoqlnFqEYUtIuJDJoTZN7DoED/7tIxw4fJTe3iHKg0O6pe/bO4xXqSKW3fQ9qeQ19XRLNZLU7RShaZJWCpcIkO0pynmXa9dcyoeuuYTX/vCGRrGzz16mNyT/+fNnyORL2gONlq/V1KnJht62S2HT6ARaxvNCEyddwE0ViZT8H6uRzkK898Yvy3qjgZtK0pKClp0jMm3SCguCFs2pUVJ2xMoL38v7rriMay57D2qfum/fafYfOKyfM3v3OSs0g7KcJFvf2UGn+0fVzEnR8WBkvMrYVJuWD9MND2kkMcwksTLgS999VAZxpPmatBKcmGhQabQJuy1MIrrNCo3pcUwZUshkGD64HyENxscn9KN6KsYzBmdx4uQp7ITNqvddTraYpdw/k1J5JlgZRqea7D18imMnpzk5XsWwM5huBtNy+b/9q282J3UFfAAAAABJRU5ErkJggg=="
  }
  parmas = {

  }
  thresholdOptions:Array<object> = [];
  processImgurl = processImgurl;
  mapInfo:any={}
  mapOuterInfo:any={}
  $refs!: {
    mapUl,
    svgPath,
    runer,
    mapOuter,
    smallMap,
    bigCard
  }
  mapList:any = []
  pathArray:any = []
  deviceMap=new Map();
  imgOptionMap = new Map()
  startPos = ''
  pathLine:any
  animationLine:any
  isShowPic = false
  svgWidth = 1000
  isMouseDown = false
  mouseDownX = 0;
  startX = 0
  playerClass="iconfont icon-play1"
  pedestrianMap:Array<object> = []
  isCenter = false
  smallTimer!:any
  objectIds:Array<string> = []
  isAccurateFiletr = false
  currentStartPosIndex = 0
  isReplay:boolean = false
  showRunner:boolean = true

  @Watch('visible', {deep: true })
  onSeriesChanged(val, oldVal){
    if(val!==oldVal){
      this.visible=this.locusVisible;
    }
  }
  deviceVisible = false

  mounted(){
    console.log(this.parentParams.captureTimeStart,this.parentParams.captureTimeEnd)
    if(this.parentParams.captureTimeStart === null){this.parentParams.captureTimeStart =''}
    if(this.parentParams.captureTimeEnd === null){this.parentParams.captureTimeEnd =''}

    //ɸѡ������ֵ���켣����
    this.formFilter.timeRange = [this.parentParams.captureTimeStart,this.parentParams.captureTimeEnd]
    this.formFilter.threshold = this.parentParams.similarity

    this.visible=this.locusVisible;
    this.$nextTick(()=>{
      // this.mapInfo = this.$refs.mapUl.getBoundingClientRect();
      // console.log(this.mapInfo)

    })
    //console.log('��������',this.parentParams,)
    similarList.map((item)=>{
      let optionItem = {
        label:item.label,
        value:item.value+''
      }
      this.thresholdOptions.push(optionItem)
    })

    //this.thresholdOptions = similarList;

    this.getLocusData("true")
  }
  onThresholdChanged(e){
    if(this.formFilter.timeRange){
      this.getLocusData("true")
    }

    this.filterDialogVisible = false
  }

  clearDate(){
    console.log('���ʱ��')
    //this.formFilter.timeRange = [null,null]
  }

  onDateChanged(e){
    //console.log(e)
    if(this.formFilter.timeRange && this.formFilter.timeRange.length && this.formFilter.timeRange.length > 0){
      this.getLocusData("true")
    }
  }
  onPicChanged(e){
    //console.log(e)
  }
  slideClick(item,index){
    //FIXME:�鿴��ͼ�Ķ�Ӧ��ϵ
    console.log(item,index,this.$refs.smallMap)
    if(this.animationLine && this.animationLine.began && this.showRunner){
      this.animationLine.pause()
      this.playerClass = "el-icon-video-play"
    }
    //console.log(item,index,this.$refs.smallMap.$children[index])
    this.$refs.smallMap.$children.map((n)=>{
      if(n.$el.classList.contains('isCurrent')){
        n.$el.classList.remove('isCurrent')
      }
    })
    this.$refs.smallMap.$children[index].$el.classList.add('isCurrent')

    //��ͼλ�ô��� offsetLeft,scrollLeft
    //console.log(this.$refs.mapUl.children.item(0))
    // this.$refs.mapUl.children.item((n)=>{
    //   console.log(n)
    //   if(n.classList.contains('box-shadow')){
    //     n.classList.remove('box-shadow')
    //   }
    // })
    let mapLen = this.$refs.mapUl.children.length;

    for(let i = 0;i<mapLen;i++){
      this.$refs.mapUl.children.item(i).classList.remove('box-shadow')
    }
    let currentEl = this.$refs.mapUl.children[index+1]
    currentEl.classList.add('box-shadow')
    this.$refs.mapOuter.scrollLeft = (currentEl.offsetLeft - (this.mapOuterInfo.width- currentEl.clientWidth)/2)
  }

  handlePicItem(){
    if(this.animationLine && this.animationLine.began && this.showRunner){
      this.animationLine.pause()
      this.playerClass = "el-icon-video-play"
      console.log(this.animationLine)
    }
  }

  userMouseDown(ev){
    if(ev.button == 0){
      this.mouseDownX = ev.clientX
      this.isMouseDown = true
      this.startX = (this.$refs.mapOuter.scrollLeft);
      //console.log('������',this.mouseDownX,this.startX)

      if(this.animationLine && this.animationLine.began && this.showRunner){
        this.animationLine.pause()
        this.playerClass = "el-icon-video-play"
        console.log(this.animationLine)
      }
    }
  }
  userMouseUp(e){
    //console.log('����',this,e)
    this.isMouseDown = false;
  }
  userMouseLeave(){
    this.isMouseDown = false;
  }
  userMouseMove(ev){
    ev.stopPropagation()
    ev.preventDefault()
    //���²��ƶ�
    if(this.isMouseDown){
      //console.log(ev)
      if(ev.movementX < 0){//����

      }
      let scrollX = ev.clientX - this.mouseDownX;

      this.$refs.mapOuter.scrollLeft = (this.startX - scrollX)
    }
  }
  setSvgWidth(e){
    //console.log("ͼƬ�������",e)
    this.mapInfo = this.$refs.mapUl.getBoundingClientRect();
    //console.log(this.mapInfo)
    this.svgWidth = this.mapInfo.width;
  }
  pageChange(val){
    console.log(val)
  }

  openDevicePopover(item,indexN,index){
    console.log(indexN,item,index)
    item.visible = !item.visible;
    //this.deviceVisible = !this.deviceVisible
    //this.$set(this.mapList[index].deviceInfos, indexN, item);

    //FIXME:�����ı䵱ǰ���ڲ��ŵĹ켣���λ��
    //FIXME:�켣�����豸��λʱPop�Զ�������������һ����λʱ����һ���رգ���ǰ�ĵ�����
    //FIXME:�û��鿴ĳ���豸���ı�켣��ʼλ�ú��ٲ���ʱ���豸POP����������
    this.startPos = this.setStartPos(item.deviceIndex-1)
    this.currentStartPosIndex = item.deviceIndex;
    this.isReplay = false;

  }
  pClose(id) {
    //console.log(id,this.$refs)
    this.$refs[`popover-` + id][0].doClose()
  }
  pOpen(id,autoClose?){
    let _this = this
    console.log('�鿴�豸',id,this.$refs)

    //FIXME: �ֶ��鿴�豸���رպ��ٲ��Ź켣ʱ����λ������һ���豸�����ٵ�������
    this.$refs[`popover-` + id][0].doShow()
    if(autoClose){
      setTimeout(()=>{
        _this.pClose(id)
      },1400)
    }

  }
  openPic(n){
    this.pClose(n.mapIndex+''+n.deviceId)
    //console.log(n)
    n.visible = !n.visible;
    this.currentObj = n
    //e.visible = false
    //this.devicePopShow = false
    //console.log(this.mapList)
    // this.mapList[mapIndex].deviceInfos.map((item)=>{
    //   if(item.deviceId == device.deviceId){
    //     item.visible = !item.visible
    //   }
    // })
    // console.log(this.mapList[mapIndex])
    if(!this.isShowPic){
      this.isShowPic = true;
    }

  }
  closePic(){
    this.isShowPic = false
  }
  getLocusData(cache?){
    let self = this
    //���ݳ�ʼ��
    this.animationLine = null
    this.deviceMap.clear()
    this.imgOptionMap.clear()
    this.isLoad = true
    this.isPathShow = false
    let offsetX:any = []

    this.pathArray = []
    this.mapList = []
    this.isExport = false
    this.hasData = false;
    if(cache === "true"){
      // console.log("ȫ������")
      this.checkedImgMap.clear();
      this.objectIds = [];
      this.pedestrianMap = [];
    }
    console.log(this.parentParams)
    let locusParmas:any = {
      "captureTimeStart": this.formFilter.timeRange[0] || null,
      "captureTimeEnd": this.formFilter.timeRange[1] || null,
      "similarity": this.formFilter.threshold+'',
      "objectIds": this.objectIds,
    }

    if(this.locusType === "face"){
      locusParmas.imageBodyBase64 = this.parentParams.imageFaceBase64;
      request.getFaceTrackApi(locusParmas).then((resp:any)=>{
        console.log(resp)
        if(resp && resp.pedestrianMap && this.objectIds.length === 0){

          this.imgOptionMap = new Map(Object.entries(resp.pedestrianMap))
          // console.log(this.imgOptionMap)
          let checkSum:Array<string> = []
          this.imgOptionMap.forEach((val,key,map)=>{
            let thisCheckedList:Array<string> = []
            val.map((item)=>{
              //Ĭ��ȫѡ
              thisCheckedList.push(item.objectId)
            })
            //console.log(thisCheckedList)
            let itemObj = {
              "month":key,
              "checkAll":true,
              "isIndeterminate":false,
              "list":val,
              "checkedList":thisCheckedList
            }

            this.pedestrianMap.push(itemObj)
            this.checkedImgMap.set(key,thisCheckedList)
            this.objectIds.push(...thisCheckedList)
            //console.log(itemObj)
          })
          //console.log(this.checkedImg)
          //thisCheckedList to checkall;
        }

        if(resp && resp.mapVos && resp.mapVos.length && resp.mapVos.length > 0){
          this.isExport = true;
          this.hasData = true;
          this.mapList = resp.mapVos;
          if(resp.mapVos.length < 3){
            this.isCenter = true
          }else{
            this.isCenter = false
          }
          let deviceIndex = 0;
          this.mapList.map((item:any,index:number)=>{
            //item.scale = this.mapInfo.height / item.height;
            item.scaleO = 400 / item.height;
            item.scale = 400 / 1080;
            //console.log(item.scale)
            item.reScale = 1 /item.scale;
            // let mapObj = new Image();
            // mapObj.src = item.url;
            // mapObj.onload = (e)=>{
            //   //console.log(self.svgWidth)
            // }
            //item.scaleWidth = (item.width * item.scale) + 16;
            item.scaleWidth = item.width * item.scaleO + 16;
            offsetX.push(item.scaleWidth);
            //console.log(...item.deviceInfos)
            item.deviceCoords = [];
            item.crossMapCoords = []

            if(item.deviceInfos && item.deviceInfos.length > 0 ){

              // console.log(this.pathArray)
              // console.log(item.deviceInfos)

              item.deviceInfos.map((de,key)=>{
                deviceIndex ++;
                de.deviceIndex = deviceIndex;
                de.mapIndex = index;
                de.devicePos = "left:"+(de.points[0]*(1080/1920)*(item.width/item.height))+"px;top:"+(1080 - de.points[1])+"px;margin-left:-13px;margin-top:-13px";
                de.deviceStyle = "transform: scale("+item.reScale+")";
                de.visible = false
                //console.log(de.deviceStyle);
                let offsetXW = offsetX.reduce(reducer) - offsetX[offsetX.length-1];
                //console.log(index,offsetX)
                de.points[0] = parseFloat((offsetXW + (de.points[0]*(1080/1920)*(item.width/item.height)) * item.scale).toFixed(2));
                de.points[1] = parseFloat(((1080 -de.points[1])*item.scale).toFixed(2));

                item.deviceCoords.push(de.points)

                item.crossMapCoords[0] = de.points

                this.pathArray.push(de.points);
                // console.log(de)
                if(de.images && de.images.length >0){

                  de.images.map((imgItem)=>{
                    imgItem.deviceName = de.deviceName
                  })
                }
                if(de.imgages && de.images.length >5){
                  de.images.length = 5
                }

                this.deviceMap.set(this.pathArray.length-1,de)
              })

            }
          })

          if(this.mapList[0].deviceInfos[0].images && this.mapList[0].deviceInfos[0].images.length >0){
            this.currentSmallSnapshots = processImgurl(this.mapList[0].deviceInfos[0].images[0].smallImageUrl)
          }


        }else{
          // this.isExport = false
          // this.hasData = false
          //this.mapList = JSON.parse(JSON.stringify(mockMapData.mapVos)) //mock����
        }
        //console.log(this.mapList)
        //if(this.mapList.length > 30){this.mapList.length = 30}
        //console.log(this.mapList)
      }).then(()=>{
        console.log(this.deviceMap,this.pathArray)

        this.pathInit()
        let currentLength = 0
        //this.isLoad = false
        if(this.mapList && this.mapList.length>0){
          this.mapOuterInfo = this.$refs.mapOuter.getBoundingClientRect();
          this.mapList.map((item,index)=>{

            currentLength += item.deviceCoords.length;
            item.crossMapCoords[1] = this.pathArray[currentLength]
            if(index == this.mapList.length-1){
              item.crossMapCoords = []
            }
          })

        }

        if(this.deviceMap.size>0 && this.deviceMap.get(0)){
          this.currentObj = this.deviceMap.get(0);
          //console.log("��һ��",this.currentObj.snapshots)
        }
        setTimeout(()=>{
          self.isLoad = false;
          self.isPathShow = true;
        },1000)
      })
    }

    if(this.locusType === "body"){
      locusParmas.imageBodyBase64 = this.imgCropData;
      request.getBodyTrackApi(locusParmas).then((resp:any)=>{

        //����mock���ݵ���
        //resp.mapVos = JSON.parse(JSON.stringify(mockMapData.mapVos))

        if(resp && resp.pedestrianMap && this.objectIds.length === 0){

          this.imgOptionMap = new Map(Object.entries(resp.pedestrianMap))
          // console.log(this.imgOptionMap)
          let checkSum:Array<string> = []
          this.imgOptionMap.forEach((val,key,map)=>{
            let thisCheckedList:Array<string> = []
            val.map((item)=>{
              //Ĭ��ȫѡ
              thisCheckedList.push(item.objectId)
            })
            //console.log(thisCheckedList)
            let itemObj = {
              "month":key,
              "checkAll":true,
              "isIndeterminate":false,
              "list":val,
              "checkedList":thisCheckedList
            }

            this.pedestrianMap.push(itemObj)
            this.checkedImgMap.set(key,thisCheckedList)
            this.objectIds.push(...thisCheckedList)
            //console.log(itemObj)
          })
          //console.log(this.checkedImg)
          //thisCheckedList to checkall;
        }

        if(resp && resp.mapVos && resp.mapVos.length && resp.mapVos.length > 0){
          this.isExport = true;
          this.hasData = true;
          this.mapList = resp.mapVos;
          if(resp.mapVos.length < 3){
            this.isCenter = true
          }else{
            this.isCenter = false
          }
          let deviceIndex = 0;
          this.mapList.map((item:any,index:number)=>{
            //item.scale = this.mapInfo.height / item.height;
            item.scaleO = 400 / item.height;
            item.scale = 400 / 1080;
            //console.log(item.scale)
            item.reScale = 1 /item.scale;
            // let mapObj = new Image();
            // mapObj.src = item.url;
            // mapObj.onload = (e)=>{
            //   //console.log(self.svgWidth)
            // }
            //item.scaleWidth = (item.width * item.scale) + 16;
            item.scaleWidth = item.width * item.scaleO + 16;
            offsetX.push(item.scaleWidth);
            //console.log(...item.deviceInfos)
            item.deviceCoords = [];
            item.crossMapCoords = []

            if(item.deviceInfos && item.deviceInfos.length > 0 ){

              // console.log(this.pathArray)
              // console.log(item.deviceInfos)

              item.deviceInfos.map((de,key)=>{
                deviceIndex ++;
                de.deviceIndex = deviceIndex;
                de.mapIndex = index;
                de.devicePos = "left:"+(de.points[0]*(1080/1920)*(item.width/item.height))+"px;top:"+(1080 - de.points[1])+"px;margin-left:-13px;margin-top:-13px";
                de.deviceStyle = "transform: scale("+item.reScale+")";
                de.visible = false
                //console.log(de.deviceStyle);
                let offsetXW = offsetX.reduce(reducer) - offsetX[offsetX.length-1];
                //console.log(index,offsetX)
                de.points[0] = parseFloat((offsetXW + (de.points[0]*(1080/1920)*(item.width/item.height)) * item.scale).toFixed(2));
                de.points[1] = parseFloat(((1080 -de.points[1])*item.scale).toFixed(2));

                item.deviceCoords.push(de.points)

                item.crossMapCoords[0] = de.points

                this.pathArray.push(de.points);
                // console.log(de)
                if(de.images && de.images.length >0){

                  de.images.map((imgItem)=>{
                    imgItem.deviceName = de.deviceName
                  })
                }
                if(de.imgages && de.images.length >5){
                  de.images.length = 5
                }

                this.deviceMap.set(this.pathArray.length-1,de)
              })

            }
          })

          if(this.mapList[0].deviceInfos[0].images && this.mapList[0].deviceInfos[0].images.length >0){
            this.currentSmallSnapshots = processImgurl(this.mapList[0].deviceInfos[0].images[0].smallImageUrl)
          }


        }else{
          // this.isExport = false
          // this.hasData = false
          //this.mapList = JSON.parse(JSON.stringify(mockMapData.mapVos)) //mock����
        }
        //console.log(this.mapList)
        //if(this.mapList.length > 30){this.mapList.length = 30}
        //console.log(this.mapList)


      }).then(()=>{
        console.log(this.deviceMap,this.pathArray)

        this.pathInit()
        let currentLength = 0
        //this.isLoad = false
        if(this.mapList && this.mapList.length>0){
          this.mapOuterInfo = this.$refs.mapOuter.getBoundingClientRect();
          this.mapList.map((item,index)=>{

            currentLength += item.deviceCoords.length;
            item.crossMapCoords[1] = this.pathArray[currentLength]
            if(index == this.mapList.length-1){
              item.crossMapCoords = []
            }
          })

        }

        if(this.deviceMap.size>0 && this.deviceMap.get(0)){
          this.currentObj = this.deviceMap.get(0);
          //console.log("��һ��",this.currentObj.snapshots)
        }
        setTimeout(()=>{
          self.isLoad = false;
          self.isPathShow = true;
        },1000)
      })

    }

  }
  filterOK(){
    this.filterDialogVisible = false;
    this.isAccurateFiletr = false;
    if(this.objectIds.length > 0){
      this.getLocusData()
    }
  }
  setStartPos(index){
    return `transform: translateX(${this.pathArray[index][0]}px) translateY(${this.pathArray[index][1]}px)`
  }
  pathInit(){
    console.log('�켣·������',this.pathArray)
    if(this.pathArray.length>0){
      this.isPathShow = true
      //this.pathLine = this.$refs.svgPath.setAttribute("d",this.pathStr(this.pathArray));
      this.startPos = this.setStartPos(0);
    }else{
      this.isPathShow = false
    }
  }
  pathStr(arr){
    let strAll='',subStr='';
    if(arr && arr.length > 0){
      arr.map((item,index)=>{
        if(index === 0){
          subStr = "M "+ item.join(" ")
        }else{
          subStr = " L "+ item.join(" ")
        }
        strAll += subStr
      })
    }
    // console.log(strAll)
    return strAll
  }
  playFn(){
    let _this = this;

    //�켣�ƶ�ʱ���رմ�ͼ
    if(this.isShowPic){
      this.isShowPic = false;
    }

    //console.log(this.currentStartPosIndex)
    if(this.currentStartPosIndex){
      this.animationLine = null;
      //this.animationLine.children.slice(this.currentStartPosIndex)
    }

    if(this.currentStartPosIndex && this.isReplay){
      this.animationLine = undefined;
      this.showRunner = false
      this.currentStartPosIndex = 0;
      this.startPos = this.setStartPos(0);
      setTimeout(()=>{
        _this.showRunner = true;
      },1000)
    }
    console.log(this.currentStartPosIndex,this.animationLine)

    //this.pathRunTimeline(this.currentStartPosIndex)

    if(!this.animationLine){
      console.log('��������')
      this.pathRunTimeline(this.currentStartPosIndex)
    }else{
      if(!this.animationLine.paused){
        this.playerClass = "el-icon-video-play"
        this.animationLine.pause()
      }else{
        this.animationLine.play()
        //this.isShowPic = true
        this.playerClass = "el-icon-video-pause"
      }
    }
  }
  pathRestart(){
    //FIXME:�ز���ͷ��ʼ
    this.animationLine.restart()
  }

  pathRunTimeline(startIndex?){
    console.log(startIndex)
    let pathData = []

    pathData = this.pathArray.slice(startIndex)
    console.log(pathData)
    this.playerClass = "el-icon-loading"
    this.mapInfo = this.$refs.mapUl.getBoundingClientRect();
    this.svgWidth = this.mapInfo.width;

    let self = this
    let trackPath = anime.path(this.$refs.svgPath);
    let halfW = this.mapOuterInfo.width/2;

    //console.log(self.deviceMap)
    this.animationLine = anime.timeline({
      targets: self.$refs.runer,
      duration: 500,
      easing: 'linear',
      begin(anim) {
        self.playerClass = "el-icon-video-pause"

        //�ز�ʱ����Ļ�������ֵΪ0
        self.$refs.mapOuter.scrollLeft = 0
      },
      complete(anim){
        //self.currentStartPosIndex = 0
        self.isReplay = true
        self.playerClass = "iconfont icon-Replay"
      }
    })



    pathData.map((item,index)=>{
      let endDelayTime = 1000
      //
      // if(self.deviceMap.get(index)){
      //   endDelayTime =  self.deviceMap.get(index).length*3000 + 100
      // }

      //TODO:�м�ѡ��ʼ��֮�󣬵����ͣ�����Ծ

      self.animationLine.add({
        translateX: item[0],
        translateY: item[1],
        duration: 1000,
        endDelay:endDelayTime,
        change(e) {
          let step = Number(e.animatables[0].transforms.list.get('translateX').split(".")[0])
          let scrollX = step - halfW;
          if(scrollX > 0){
            self.$refs.mapOuter.scrollLeft = scrollX
          }
        },
        changeBegin(e){
          // console.log(e)
        },
        changeComplete(e) {
          if(self.deviceMap.get(index)){
            let currentDevice = self.deviceMap.get(index+self.currentStartPosIndex)
            console.log('�豸:',index,self.deviceMap.get(index))
            self.currentObj = currentDevice

            self.pOpen(currentDevice.mapIndex+''+currentDevice.deviceId,true)
            //console.log(self.deviceMap.get(index))
            currentDevice.images.map((item,index)=>{
              self.smallTimer = setTimeout(()=>{
                self.currentSmallSnapshots = processImgurl(item.smallImageUrl)
              },index*3000)
            })

          }
        }
      })
    })
  }
  cancelExport(){
    this.$emit("cancel")
  }
  showExportLocusDialog(){
    //console.log('�����켣')
    let exportParams = {
      "captureTimeStart": this.formFilter.timeRange[0] || '',
      "captureTimeEnd": this.formFilter.timeRange[1] || '',
      "imageBodyBase64": this.imgCropData,
      "similarity": this.formFilter.threshold+'',
      "objectIds": this.objectIds,
      "userId": Cache.sessionGet("userInfo")?Cache.sessionGet("userInfo").userId:""
    }
    request.trajectoryExport(exportParams).then((resp:any)=>{
      //console.log(resp)
      if(resp && resp.count){
        this.$message({
          showClose: true,
          message: this.$t("log.exportSuccess") as string,
          type: 'success',
          duration: 3 * 1000,
        });
      }
    })
  }
  accurateFiletr(){
    this.filterDialogVisible = true
    this.isAccurateFiletr = true
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "@/styles/variables.scss";
.dialog-locus{
  // display:block !important;
  width:100%;
  height:100%;
  .dialog-ctx{
    width: 100%;
    height: 100%;
    .el-form-item{
      margin-bottom: 18px;
    }
  }
  .locus-header{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 16px;
  }

  .locus-body{
    width: 100%;
    background: #F4F4F4;
    position: relative;
    padding: 0 16px;

    .locus-bigmap{
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 14px 0 60px;
      position: relative;
      &::-webkit-scrollbar-thumb {
        background: rgb(108, 173, 238);
        border-radius:5px;
        &:hover{
          background: #1989FA;
        }
      }
      .ul{
        display: flex;
        transform: translateX(0px);
        white-space:nowrap;
        height: 400px;
        float: left;
        .li:first-child{
          margin-left: 0;
        }
        .li:last-child{
          margin-right: 0;
        }
        .li{
          flex-shrink:0;
          height: 400px;
          // border: 1px solid #e4e5e6;
          background: #eee;
          border-radius: 1px;
          margin-right: 16px;
          position: relative;
          display: block;
          box-sizing:border-box;
          img{
            height: 100%;
            opacity: .8;
          }
          .map-waper{
            position: absolute;
            left: 0;
            top: 0;
            transform-origin: left top;
          }
          .maplayer{
            height: 100%;
            position: relative;
            }
            .map-img{
              z-index: 0;
              display: block;
              border-radius: 1px;
            }
            .device-list{
              position: absolute;
              left: 0;
              top:0;
              z-index: 1;
              transform-origin: left top;
              .device-place{
                position: absolute;
                margin-left: -8px;
                margin-top: -24px;

                i{
                  font-size: 22px;
                  color: #2a5af5;
                  cursor: pointer;
                  &:focus{
                    outline: none;
                    color: #0033ff;
                  }
                }
              }
            }

          .floor-name{
            position: absolute;
            bottom: -22px;
          }
        }
        .box-shadow{
          box-shadow: 0 5px 15px rgba(0,0,0,.16);
          img{
            opacity: 1;
            //transform: scale(1.01);
          }
          .floor-name{
            font-weight: bold;
          }
        }
      }
      .svg-layer{
        position: absolute;
        z-index: 1;
        left: 0;
        //top: 14px;
        top: 0px;
        height: 400px;
        pointer-events: none;
        svg{
          height: 400px;
        }
        .svg-path{
          z-index: 99;
          stroke-width: 2.6;
          border: 1px solid #fff;
          //stroke-dasharray: 6, 6;
          .cross-path{
            stroke-width: 1.6;
          }
        }
        .runer{
          fill: #ff0000;
          stroke:none;
          opacity: .8;
          // animation:breathe 3s ease-in-out infinite alternate;
          // box-shadow: 0 0 10px rgba(59,235,235,.6);
        }
      }
    }
    .player{
      width: 30px;
      min-height: 30px;
      text-align: center;
      position: absolute;
      left: calc(50% - 15px);
      bottom: 8px;
      i{
        font-size: 32px;
        cursor: pointer;
        &:hover{
          color: #1989FA;
        }
      }
    }
  }
  .isCenter{
    display: flex;
    justify-content: center;
    .locus-bigmap{
      width: auto;
      max-width: 100%;
      .ul{
        padding: 0;
      }
    }
  }
// @keyframes breathe {
// 	0% {
//     opacity:.6;
//     box-shadow:0 1px 2px rgba(255,255,255,0.1);
//   }
//   50% {
//     opacity:1;
//     border:1px solid rgba(59,235,235,1);
//     box-shadow:0 1px 30px rgba(59,255,255,1);
//   }
// }
  .locus-footer{
    width: 100%;
    height: 223px;
    padding: 16px;
    padding-left: 8px;
    display: flex;
    h4{
      margin: 8px;
    }
    .small-thum{
      width: 110px;
      height: 100%;
      overflow: hidden;
      .el-image{
        width: 95px;
        height: 150px;
        background: #DFEAFC;
        box-shadow: 0 3px 6px rgba(109, 124, 150, .5);
        border-radius: 2px;
        overflow: hidden;
        margin-left: 8px;
      }
    }
    .locus-thum{
      flex: 1;
      overflow-x: auto;
      padding: 0 32px;
      &::-webkit-scrollbar-thumb {
        background: rgb(108, 173, 238);
        border-radius:5px;
        &:hover{
          background: #1989FA;
        }
      }
      h4{text-indent: 8px;}
      .VueCarousel-slide{
        width: 222px;
        height: 150px;
        padding-right: 8px;
        padding-left:8px;

        .outer{
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          height: 100%;
          .title{
            font-size: 12px;
            line-height: 24px;
            text-indent: 4px;
            position: relative;
            strong,span{
              display: inline-block;

            }
            strong{
              max-width: 55%;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            span{
              max-width: 45%;
              position: absolute;
              right: 4px;
              text-align: right;
            }
          }
        }
        .el-image{
          width: 100%;
          height: 120px;
          background: #F4F4F4;
        }
      }
      .isCurrent{
        .outer{
          border: 1px solid rgb(60, 77, 109);
        }
      }
    }
  }
}
.bigPic{
  position: absolute;
  right: 16px;
  top: 0;
  z-index: 999;
  width: 500px;
  height: 330px;
  transform-origin: right top;
  h4{
    padding: 16px;
    margin: 0;
  }
  .el-icon-close{
    position: absolute;
    right: 8px;
    top: 8px;
    cursor: pointer;
    font-size: 20px;
    padding: 4px;
  }
  .VueCarousel{
    height: calc(100% - 48px);

  }
  @include shadowBox(8px);
  overflow: hidden;
  .el-carousel{
    width: 100%;
    height: calc(100% - 48px);
    overflow-y: visible;
    .el-carousel__container{
      height: 100%;
    }
    .el-carousel__item{
      overflow: visible;
    }
  }
  .el-image{
    width: 100%;
    height: calc(100% - 30px);
    text-align: center;
    background: #f4f5f6;

    .el-image__placeholder{
      background: #eee;
    }
  }

  .shot-time{
    display: flex;
    justify-content: space-around;
    padding: 4px 8px;
    em{font-style: normal;}
  }
}
.small-carousel{
  img{
    width: 50px;
    height: 50px;
    line-height: 30px;
  }
}

::v-deep {

  .VueCarousel-navigation--disabled{
    opacity: .3;
  }
  .VueCarousel-navigation-button{
    font-family: "element-icons" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #28354d;
    border-radius: 3px;
    &:focus{
      outline: 1px dashed lightblue;
    }
  }
  .VueCarousel-navigation-prev{
    &::before{
      content: "\e6de";
    }
  }
  .VueCarousel-navigation-next{
    &::before{
      content: "\e6e0";
    }
  }
  .bigCard{
    .VueCarousel-wrapper{
      height: 280px;
    }
    .VueCarousel-inner{
      height: 100%!important;
      .VueCarousel-slide {
        .el-image{
          height: calc(100% - 30px);
        }
      }
    }
    .VueCarousel-navigation{
      .VueCarousel-navigation-button{
        background: rgba(255,255,255,.3);
        border-radius: 3em;
        display: block;
        line-height: 1;
      }
      .VueCarousel-navigation-prev{
        transform: translateY(-90%) translateX(20%);
      }
      .VueCarousel-navigation-next{
        transform: translateY(-90%) translateX(-20%);
      }
    }
    &:hover{
      .VueCarousel-navigation-button{
        background: rgba(255,255,255,.5);
      }
    }
  }
}
::v-deep .el-dialog{
  .el-dialog__body{
    margin-left: -24px;
    margin-right: -24px;
    max-height: 800px;
    height: 776px;
  }
}
::v-deep .image-error,
::v-deep .locus-footer .image-error,
::v-deep .bigPic .image-error{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #ccc;
  i{
    font-size: 32px;
  }
}

.popcon{
  display: flex;
  .device-pop-info{
    font-size: 12px;
    padding-left: 8px;
    span{
      display: block;
      width: 94%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-bottom: 3px;
    }
    strong{
      font-size: 1.3em;
    }
  }
}
.exact-filter-body{
  height: 600px;
  overflow-y: auto;
  margin-right: -12px;
  margin-bottom: 4px;
  .el-checkbox-group{
    .el-checkbox{
      width: 116px;
      height: 162px;
      margin-right: 0px;
      position: relative;
      padding: 8px;
      .el-image{
        width: 100%;
        height: 100%;
        box-shadow: 0 3px 6px rgba(109, 124, 150, .2);
        background: #f4f5f6;
      }
      .label{
        position: absolute;
        left: 0;
        bottom: 0;
        line-height: 1.8;
        background: rgba(109, 124, 150, 0.7);
        color: #fff;
        text-indent: 8px;
        width: 100%;
      }
    }
    .is-checked{
      .el-image{
        border:2px solid #1b87fb;
      }
    }
  }
  ul{
    display: flex;
    flex-wrap: wrap;
    justify-content:flex-start;
    overflow-y:auto;
    li{
      width: 10%;
      height: 140;

    }
  }
}
::v-deep {
  .el-checkbox-group{
    .el-checkbox__input{
      position: absolute;
      right: 12px;
      top: 12px;
      .el-checkbox__inner{
        border-radius: 2px;
      }
    }
    .el-checkbox__label{
      padding-left: 0;
      width: 100%;
      height: 100%;
      position: relative;
    }
  }
}
.exact-filter-dialog{
  h3{
    margin: 8px;
    font-size: 16px;
  }
  .handle-btn{
    position: absolute;
    right: 20px;
    top: 17px;
  }
  .month-title{
    padding-left: 8px;
    font-weight: bold;
  }
}
.dialog-nodata{
  display: flex;
  height: 90%;
  justify-content: center;
  align-items: center;
}

.icon-torus{
  //margin: 10px;
  &::before{
    content: '';
    display: block;
    width: 1.22em;
    background: #fff;
    height: 1.22em;
    border-radius: 0.8em;
    border: 4px solid $--color-primary;
    box-shadow: 0 3px 3px rgba(0,0,0,.16);
  }

}
</style>
