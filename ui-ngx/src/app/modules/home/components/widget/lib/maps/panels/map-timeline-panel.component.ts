///
/// Copyright © 2016-2025 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {
  ChangeDetectorRef,
  Component, DestroyRef,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { TripTimelineSettings } from '@home/components/widget/lib/maps/models/map.models';
import { DateFormatProcessor } from '@shared/models/widget-settings.models';
import { interval, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tb-map-timeline-panel',
  templateUrl: './map-timeline-panel.component.html',
  styleUrls: ['./map-timeline-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapTimelinePanelComponent implements OnInit {

  @Input()
  settings: TripTimelineSettings;

  @Input()
  disabled = false;

  @Input()
  set min(value: number) {
    if (this.minValue !== value) {
      this.minValue = value;
      this.maxTimeIndex = Math.ceil((this.maxValue - this.minValue) / this.settings.timeStep);
      this.cd.markForCheck();
    }
  }

  get min(): number {
    return this.minValue;
  }

  @Input()
  set max(value: number) {
    if (this.maxValue !== value) {
      this.maxValue = value;
      this.maxTimeIndex = Math.ceil((this.maxValue - this.minValue) / this.settings.timeStep);
      this.cd.markForCheck();
    }
  }

  get max(): number {
    return this.maxValue;
  }

  @Input()
  set currentTime(time: number) {
    if (this.currentTimeValue !== time) {
      this.currentTimeValue = time;
      this.updateTimestampDisplayValue();
      this.cd.markForCheck();
    }
  }

  get currentTime(): number {
    return this.currentTimeValue;
  }

  get hasData(): boolean {
    return !!this.currentTimeValue && this.currentTimeValue !== Infinity;
  }

  @Input()
  anchors: number[] = [];

  @Output()
  timeChanged = new EventEmitter<number>();

  timestampFormat: DateFormatProcessor;

  minTimeIndex = 0;
  maxTimeIndex = 0;
  index = 0;
  playing = false;
  interval: Subscription;
  speed: number;

  private minValue: number;
  private maxValue: number;
  private currentTimeValue: number = null;

  constructor(public element: ElementRef<HTMLElement>,
              private cd: ChangeDetectorRef,
              private destroyRef: DestroyRef,
              private injector: Injector) {
  }

  ngOnInit() {
    if (this.settings.showTimestamp) {
      this.timestampFormat = DateFormatProcessor.fromSettings(this.injector, this.settings.timestampFormat);
      this.timestampFormat.update(this.currentTime);
    }
    this.speed = this.settings.speedOptions[0];
  }

  public onIndexChange(index: number) {
    this.index = index;
    this.updateCurrentTime();
  }

  public play() {
    this.playing = true;
    if (!this.interval) {
      this.interval = interval(1000 / this.speed)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.playing)
      ).subscribe(
        {
          next: () => {
            if (this.index < this.maxTimeIndex) {
              this.index++;
              this.updateCurrentTime();
            } else {
              this.playing = false;
              this.cd.markForCheck();
              this.interval.unsubscribe();
              this.interval = null;
            }
          },
          error: (err) => {
            console.error(err);
          }
        }
      );
    }
  }

  public pause() {
    this.playing = false;
    this.updateCurrentTime();
  }

  public fastRewind() {
    this.index = this.minTimeIndex;
    this.pause();
  }

  public fastForward() {
    this.index = this.maxTimeIndex;
    this.pause();
  }

  public moveNext() {
    if (this.index < this.maxTimeIndex) {
      if (this.settings.snapToRealLocation) {
        const anchorIndex = this.findIndex(this.currentTime, this.anchors) + 1;
        this.index = Math.floor((this.anchors[anchorIndex] - this.minValue) / this.settings.timeStep);
      } else {
        this.index++;
      }
    }
    this.pause();
  }

  public movePrev() {
    if (this.index > this.minTimeIndex) {
      if (this.settings.snapToRealLocation) {
        const anchorIndex = this.findIndex(this.currentTime, this.anchors) - 1;
        this.index = Math.floor((this.anchors[anchorIndex] - this.minValue) / this.settings.timeStep);
      } else {
        this.index--;
      }
    }
    this.pause();
  }

  public speedUpdated() {
    if (this.interval) {
      this.interval.unsubscribe();
      this.interval = null;
    }
    if (this.playing) {
      this.play();
    }
  }

  private updateCurrentTime() {
    const newTime = this.minValue + this.index * this.settings.timeStep;
    if (this.currentTime !== newTime) {
      this.currentTime = newTime;
      this.timeChanged.emit(this.currentTime);
      this.updateTimestampDisplayValue();
    }
  }

  private updateTimestampDisplayValue() {
    if (this.settings.showTimestamp && this.hasData) {
      this.timestampFormat.update(this.currentTime);
      this.cd.markForCheck();
    }
  }

  private findIndex(value: number, array: number[]): number {
    let i = 0;
    while (array[i] < value) {
      i++;
    }
    return i;
  }

}
