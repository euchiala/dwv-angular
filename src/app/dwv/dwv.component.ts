import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { VERSION } from '@angular/core';
import {
  App,
  AppOptions,
  DrawLayer,
  ViewConfig,
  ToolConfig,
  decoderScripts,
  getDwvVersion
} from 'dwv';
import { MatDialog } from '@angular/material/dialog';
import { TagsDialogComponent } from './tags-dialog.component';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ViewChild, ElementRef } from '@angular/core';

// gui overrides

// Image decoders (for web workers)
decoderScripts.jpeg2000 = 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js';
decoderScripts['jpeg-lossless'] = 'assets/dwv/decoders/rii-mango/decode-jpegloss.js';
decoderScripts['jpeg-baseline'] = 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js';
decoderScripts.rle = 'assets/dwv/decoders/dwv/decode-rle.js';

@Component({
  selector: 'app-dwv',
  templateUrl: './dwv.component.html',
  styleUrls: ['./dwv.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DwvComponent implements OnInit {
  @ViewChild('magnifierCanvas', { static: true }) magnifierCanvasRef!: ElementRef<HTMLCanvasElement>;

  public versions: any;
  public tools = {
    Scroll: new ToolConfig(),
    ZoomAndPan: new ToolConfig(),
    WindowLevel: new ToolConfig(),
    ColourMap: new ToolConfig(),
    Draw: new ToolConfig(['Ruler', 'Circle', 'Rectangle'])
  };
  public toolNames: string[] = [];
  public selectedTool = 'Select Tool';
  public loadProgress = 0;
  public dataLoaded = false;
  public colours = false;

  private dwvApp!: App;
  private metaData!: any;
  private draw?: DrawLayer;
  private orientation!: string;

  // drop box class name
  private dropboxDivId = 'dropBox';
  private dropboxClassName = 'dropBox';
  private borderClassName = 'dropBoxBorder';
  private hoverClassName = 'hover';

  public jsonTest = '{"version": "0.5","window-center": 50,"window-width": 350,"position": [256,256,0],"scale": {"x": 1,"y": 1,"z": 1},"offset": {"x": 0,"y": 0,"z": 0},"drawings": {"attrs": {},"className": "Layer","children": [{"attrs": {"name": "position-group","id": "#2-0"},"className": "Group","children": [{"attrs": {"name": "ruler-group","id": "xl91ojvphr","draggable": true},"className": "Group","children": [{"attrs": {"x": 196.14503947879655,"y": 253.72646536412077,"scaleX": 1.8188277087033748,"scaleY": 1.8188277087033748,"name": "label"},"className": "Label","children": [{"attrs": {"fontSize": 10,"fontFamily": "Verdana","fill": "#ffff80","padding": 3,"shadowColor": "#000","shadowOffsetX": 0.25,"shadowOffsetY": 0.25,"name": "text","text": "88.36 mm"},"className": "Text"},{"attrs": {"fill": "#ffff80","opacity": 0.2,"width": 58.0361328125,"height": 16},"className": "Tag"}]},{"attrs": {"points": [120.79736260876041,185.34414339659344,125.65379192054672,176.60257063537807],"stroke": "#ffff80","strokeScaleEnabled": false,"name": "shape-tick0"},"className": "Line"},{"attrs": {"points": [251.7529576354034,258.0972517447285,256.6093869471897,249.35567898351314],"stroke": "#ffff80","strokeScaleEnabled": false,"name": "shape-tick1"},"className": "Line"},{"attrs": {"points": [123.22557726465357,180.97335701598578,254.18117229129655,253.72646536412077],"stroke": "#ffff80","strokeScaleEnabled": false,"name": "shape"},"className": "Line"},{"attrs": {"x": 123.22557726465357,"y": 180.97335701598578,"stroke": "#999","fill": "rgba(100,100,100,0.7","strokeScaleEnabled": false,"radiusX": 5.4564831261101245,"radiusY": 5.4564831261101245,"name": "anchor","id": "begin","dragOnTop": false,"draggable": true,"visible": false},"className": "Ellipse"},{"attrs": {"x": 254.18117229129655,"y": 253.72646536412077,"stroke": "#999","fill": "rgba(100,100,100,0.7","strokeScaleEnabled": false,"radiusX": 5.4564831261101245,"radiusY": 5.4564831261101245,"name": "anchor","id": "end","dragOnTop": false,"draggable": true,"visible": false},"className": "Ellipse"}]},{"attrs": {"name": "circle-group","id": "xukvng3tmz","draggable": true},"className": "Group","children": [{"attrs": {"x": 207.8010657193605,"y": 141.86856127886324,"scaleX": 1.8188277087033748,"scaleY": 1.8188277087033748,"name": "label"},"className": "Label","children": [{"attrs": {"fontSize": 10,"fontFamily": "Verdana","fill": "#ffff80","padding": 3,"shadowColor": "#000","shadowOffsetX": 0.25,"shadowOffsetY": 0.25,"name": "text","text": "9.192 cm²"},"className": "Text"},{"attrs": {"fill": "#ffff80","opacity": 0.2,"width": 58.939453125,"height": 16},"className": "Tag"}]},{"attrs": {"x": 207.8010657193605,"y": 141.86856127886324,"radius": 29,"stroke": "#ffff80","strokeScaleEnabled": false,"name": "shape"},"className": "Circle"}]},{"attrs": {"name": "rectangle-group","id": "msf98ei3o6k","draggable": true,"visible":true},"className": "Group","children": [{"attrs": {"x": 93.21492007104791,"y": 310.1101243339254,"scaleX": 1.8188277087033748,"scaleY": 1.8188277087033748,"name": "label"},"className": "Label","children": [{"attrs": {"fontSize": 10,"fontFamily": "Verdana","fill": "#ffff80","padding": 3,"shadowColor": "#000","shadowOffsetX": 0.25,"shadowOffsetY": 0.25,"name": "text","text": "13.24 cm²"},"className": "Text"},{"attrs": {"fill": "#ffff80","opacity": 0.2,"width": 58.939453125,"height": 16},"className": "Tag"}]},{"attrs": {"x": 93.21492007104791,"y": 264.639431616341,"width": 83.66607460035527,"height": 45.47069271758437,"stroke": "#ffff80","strokeScaleEnabled": false,"name": "shape"},"className": "Rect"}]}]}]},"drawingsDetails": {"xl91ojvphr": {"meta": {"textExpr": "{length}","quantification": {"length": {"value": 88.36320575710334,"unit": "mm"}}}},"xukvng3tmz": {"meta": {"textExpr": "{surface}","quantification": {"surface": {"value": 9.192207777935064,"unit": "cm²"},"min": {"value": -31,"unit": ""},"max": {"value": 134,"unit": ""},"mean": {"value": 70.31956027293404,"unit": ""},"stdDev": {"value": 16.254416915201556,"unit": ""}}}},"msf98ei3o6k": {"meta": {"textExpr": "{surface}","quantification": {"surface": {"value": 13.235944209055152,"unit": "cm²"},"min": {"value": 9,"unit": ""},"max": {"value": 122,"unit": ""},"mean": {"value": 61.63650793650794,"unit": ""},"stdDev": {"value": 15.346841547284253,"unit": ""}}}}}}';

  constructor(public dialog: MatDialog) {
    this.toolNames = Object.keys(this.tools)
      // Filter out 'Draw'
      .filter(tool => tool !== 'Draw');

    // Add additional tools specified in Draw tool configuration
    if (this.tools.Draw && this.tools.Draw.options) {
      this.toolNames.push(...this.tools.Draw.options);
    }
    this.versions = {
      dwv: getDwvVersion(),
      angular: VERSION.full
    };
  }

  ngOnInit() {
    // create app
    this.dwvApp = new App();
    // initialise app
    const viewConfig0 = new ViewConfig('layerGroup0');
    const viewConfigs = { '*': [viewConfig0] };
    const options = new AppOptions(viewConfigs);
    options.tools = this.tools;
    this.dwvApp.init(options);
    // handle load events
    let nLoadItem = 0;
    let nReceivedLoadError = 0;
    let nReceivedLoadAbort = 0;
    let isFirstRender = false;
    this.dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.dataLoaded = false;
      nLoadItem = 0;
      nReceivedLoadError = 0;
      nReceivedLoadAbort = 0;
      isFirstRender = true;
      // hide drop box
      this.showDropbox(false);
    });
    this.dwvApp.addEventListener('loadprogress', (event: ProgressEvent) => {
      this.loadProgress = event.loaded;
    });
    this.dwvApp.addEventListener('renderend', (/*event*/) => {
      if (isFirstRender) {
        isFirstRender = false;
        // available tools
        let selectedTool = 'ZoomAndPan';
        if (this.dwvApp.canScroll()) {
          selectedTool = 'Scroll';
        }
        this.onChangeTool(selectedTool);
      }
    });
    this.dwvApp.addEventListener('load', (event: any) => {
      // set dicom tags
      this.metaData = this.dwvApp.getMetaData(event.loadid);
      // set data loaded flag
      this.dataLoaded = true;
    });
    this.dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedLoadError) {
        this.loadProgress = 0;
        alert('Received errors during load. Check log for details.');
        // show drop box if nothing has been loaded
        if (!nLoadItem) {
          this.showDropbox(true);
        }
      }
      if (nReceivedLoadAbort) {
        this.loadProgress = 0;
        alert('Load was aborted.');
        this.showDropbox(true);
      }
    });
    this.dwvApp.addEventListener('loaditem', (/*event*/) => {
      ++nLoadItem;
    });
    this.dwvApp.addEventListener('loaderror', (event: ErrorEvent) => {
      console.error(event.error);
      ++nReceivedLoadError;
    });
    this.dwvApp.addEventListener('loadabort', (/*event*/) => {
      ++nReceivedLoadAbort;
    });

    // handle key events
    this.dwvApp.addEventListener('keydown', (event: KeyboardEvent) => {
      this.dwvApp.defaultOnKeydown(event);
    });
    // handle window resize
    window.addEventListener('resize', this.dwvApp.onResize);

    // setup drop box
    this.setupDropbox();

    // possible load from location
    this.dwvApp.loadFromUri(window.location.href);
    this.dwvApp.loadURLs([
      window.location.href + 'assets/image-00000.dcm'
     ]);
  }
  magnifyCanvas() {
    let zoom = 3;
    var canvas = document.getElementById('layerGroup0-layer-0')?.querySelector('canvas');
    let glass: any;
    let w: any;
    let h: any;
    let bw: any;
    let ctx: any;

    ctx = canvas?.getContext("2d");
    /*create magnifier glass:*/
    glass = document.createElement("DIV");
    glass.setAttribute("class", "canvas-magnifier-glass");
    /*insert magnifier glass:*/
    canvas!.parentElement!.insertBefore(glass, canvas!);
    /*set background properties for the magnifier glass:*/
    glass.style.backgroundImage = "url('" + canvas!.toDataURL() + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (canvas!.width * zoom) + "px " + (canvas!.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;
    /*execute a function when someone moves the magnifier glass over the canvas:*/
    glass.addEventListener("mousemove", moveMagnifier);
    canvas?.addEventListener("mousemove", moveMagnifier);
    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    canvas?.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e: any) {
      var pos, x, y;
      /*prevent any other actions that may occur when moving over the canvas*/
      e.preventDefault();
      /*get the cursor's x and y positions:*/
      pos = getCursorPos(e);
      x = pos.x;
      y = pos.y;
      /*prevent the magnifier glass from being positioned outside the canvas:*/
      if (x > canvas!.width - (w / zoom)) { x = canvas!.width - (w / zoom); }
      if (x < w / zoom) { x = w / zoom; }
      if (y > canvas!.height - (h / zoom)) { y = canvas!.height - (h / zoom); }
      if (y < h / zoom) { y = h / zoom; }
      /*set the position of the magnifier glass:*/
      glass.style.left = (x - w) + "px";
      glass.style.top = (y - h) + "px";
      /*display what the magnifier glass "sees":*/
      glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }
    function getCursorPos(e: any) {
      var a, x = 0, y = 0;
      e = e || window.event;
      /*get the x and y positions of the canvas:*/
      a = canvas!.getBoundingClientRect();
      /*calculate the cursor's x and y coordinates, relative to the canvas:*/
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /*consider any page scrolling:*/
      x = x - window.scrollX;
      y = y - window.scrollY;
      return { x: x, y: y };
    }
  }

  disableMagnifier() {
    var magnifierGlassDiv = document.getElementsByClassName('canvas-magnifier-glass')[0];
    if (magnifierGlassDiv) {
      magnifierGlassDiv.parentNode?.removeChild(magnifierGlassDiv);
    }
  }

  /**
   * Get the icon of a tool.
   *
   * @param tool The tool name.
   * @returns The associated icon string.
   */
  getToolIcon = (tool: string) => {
    let res!: string;
    if (tool === 'Scroll') {
      res = 'menu';
    } else if (tool === 'ZoomAndPan') {
      res = 'open_with';
    } else if (tool === 'WindowLevel') {
      res = 'contrast';
    } else if (tool === 'ColourMap') {
      res = 'palette';
    } else if (tool === 'Ruler') {
      res = 'straighten';
    } else if (tool === 'Circle') {
      res = 'circle';
    } else if (tool === 'Rectangle') {
      res = 'crop_landscape';
    }
    return res;
  }

  /**
   * Handle a colour change event.
   * @param colourMap The new colourMap name.
   */
  onColourMapChange(colourMap: string) {
    this.dwvApp.setColourMap(colourMap);
  }

  /**
   * Handle a change tool event.
   * @param tool The new tool name.
   */
  onChangeTool = (tool: string) => {
    if (this.dwvApp) {
      this.disableMagnifier();
      this.selectedTool = tool;
      this.colours = false;
      if ((tool === 'Ruler' || tool === 'Circle' || tool === 'Rectangle') &&
        typeof this.tools.Draw.options !== 'undefined') {
        this.dwvApp.setTool('Draw');
        this.onChangeShape(tool);
      }
      else if (tool == 'ColourMap') {
        this.colours = true;
      } else {
        this.dwvApp.setTool(tool);
      }
    }
  }

  /**
   * Check if a tool can be run.
   *
   * @param tool The tool name.
   * @returns True if the tool can be run.
   */
  canRunTool = (tool: string) => {
    let res: boolean;
    if (tool === 'Scroll') {
      res = this.dwvApp.canScroll();
    } else if (tool === 'WindowLevel') {
      res = this.dwvApp.canWindowLevel();
    } else {
      res = true;
    }
    return res;
  }

  saveData() {
    // var drawCanvas = document.getElementById('layerGroup0-layer-1')?.querySelector('canvas');

    // // Get the 2D drawing context
    // var drawContext = drawCanvas?.getContext('2d');

    // // Get the drawing data
    // var drawingData = drawContext?.getImageData(0, 0, drawCanvas!.width, drawCanvas!.height);
    // var lineData = drawContext?.getLineDash();
    // let element = document.getElementById("layerGroup0-layer-1") as HTMLDivElement;
    // this.draw = new DrawLayer(element);
    // this.draw.getDataIndex()
    console.log(this.dwvApp.getJsonState());
    this.dwvApp.applyJsonState(this.jsonTest);

  }
  /**
   * For toogle button to not get selected.
   *
   * @param event The toogle change.
   */
  onSingleToogleChange = (event: MatButtonToggleChange) => {
    // unset value -> do not select button
    event.source.buttonToggleGroup.value = '';
  }

  /**
   * Toogle the viewer orientation.
   */
  toggleOrientation = () => {
    this.disableMagnifier();
    if (typeof this.orientation !== 'undefined') {
      if (this.orientation === 'axial') {
        this.orientation = 'coronal';
      } else if (this.orientation === 'coronal') {
        this.orientation = 'sagittal';
      } else if (this.orientation === 'sagittal') {
        this.orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.orientation = 'coronal';
    }
    // update data view config
    const viewConfig0 = new ViewConfig('layerGroup0');
    viewConfig0.orientation = this.orientation;
    const viewConfigs = { '*': [viewConfig0] };
    this.dwvApp.setDataViewConfigs(viewConfigs);
    // render data
    for (let i = 0; i < this.dwvApp.getNumberOfLoadedData(); ++i) {
      this.dwvApp.render(i);
    }
  }

  /**
   * Handle a change draw shape event.
   * @param shape The new shape name.
   */
  private onChangeShape = (shape: string) => {
    if (this.dwvApp && (this.selectedTool === 'Ruler' || this.selectedTool === 'Circle' || this.selectedTool === 'Rectangle')) {
      this.dwvApp.setToolFeatures({ shapeName: shape });
    }
  }

  /**
   * Handle a reset event.
   */
  onReset = () => {
    if (this.dwvApp) {
      this.disableMagnifier();
      this.dwvApp.resetDisplay();

    }
  }

  /**
   * Open the DICOM tags dialog.
   */
  openTagsDialog = () => {
    this.disableMagnifier();
    this.dialog.open(TagsDialogComponent,
      {
        data: {
          title: 'DICOM Tags',
          value: this.metaData
        }
      }
    );
  }

  // drag and drop [begin] -----------------------------------------------------

  /**
   * Setup the data load drop box: add event listeners and set initial size.
   */
  private setupDropbox = () => {
    this.showDropbox(true);
  }

  /**
   * Default drag event handling.
   * @param event The event to handle.
   */
  private defaultHandleDragEvent = (event: DragEvent) => {
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Handle a drag over.
   * @param event The event to handle.
   */
  private onBoxDragOver = (event: DragEvent) => {
    this.defaultHandleDragEvent(event);
    // update box border
    const box = document.getElementById(this.dropboxDivId);
    if (box && box.className.indexOf(this.hoverClassName) === -1) {
      box.className += ' ' + this.hoverClassName;
    }
  }

  /**
   * Handle a drag leave.
   * @param event The event to handle.
   */
  private onBoxDragLeave = (event: DragEvent) => {
    this.defaultHandleDragEvent(event);
    // update box border
    const box = document.getElementById(this.dropboxDivId);
    if (box && box.className.indexOf(this.hoverClassName) !== -1) {
      box.className = box.className.replace(' ' + this.hoverClassName, '');
    }
  }

  /**
   * Handle a drop event.
   * @param event The event to handle.
   */
  private onDrop = (event: DragEvent) => {
    this.defaultHandleDragEvent(event);
    // load files
    if (event.dataTransfer) {
      const files = Array.from(event.dataTransfer.files);
      this.dwvApp.loadFiles(files);
    }
  }

  /**
   * Handle a an input[type:file] change event.
   * @param event The event to handle.
   */
  private onInputFile = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
      const files = Array.from(target.files);
      this.dwvApp.loadFiles(files);
    }
  }

  /**
   * Show/hide the data load drop box.
   * @param show True to show the drop box.
   */
  private showDropbox = (show: boolean) => {
    const box = document.getElementById(this.dropboxDivId);
    if (!box) {
      return;
    }
    const layerDiv = document.getElementById('layerGroup0');

    if (show) {
      // reset css class
      box.className = this.dropboxClassName + ' ' + this.borderClassName;
      // check content
      if (box.innerHTML === '') {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode('Drag and drop data here or '));
        // input file
        const input = document.createElement('input');
        input.onchange = this.onInputFile;
        input.type = 'file';
        input.multiple = true;
        input.id = 'input-file';
        input.style.display = 'none';
        const label = document.createElement('label');
        label.htmlFor = 'input-file';
        const link = document.createElement('a');
        link.appendChild(document.createTextNode('click here'));
        link.id = 'input-file-link';
        label.appendChild(link);
        p.appendChild(input);
        p.appendChild(label);

        box.appendChild(p);
      }
      // show box
      box.setAttribute('style', 'display:initial');
      // stop layer listening
      if (layerDiv) {
        layerDiv.removeEventListener('dragover', this.defaultHandleDragEvent);
        layerDiv.removeEventListener('dragleave', this.defaultHandleDragEvent);
        layerDiv.removeEventListener('drop', this.onDrop);
      }
      // listen to box events
      box.addEventListener('dragover', this.onBoxDragOver);
      box.addEventListener('dragleave', this.onBoxDragLeave);
      box.addEventListener('drop', this.onDrop);
    } else {
      // remove border css class
      box.className = this.dropboxClassName;
      // remove content
      box.innerHTML = '';
      // hide box
      box.setAttribute('style', 'display:none');
      // stop box listening
      box.removeEventListener('dragover', this.onBoxDragOver);
      box.removeEventListener('dragleave', this.onBoxDragLeave);
      box.removeEventListener('drop', this.onDrop);
      // listen to layer events
      if (layerDiv) {
        layerDiv.addEventListener('dragover', this.defaultHandleDragEvent);
        layerDiv.addEventListener('dragleave', this.defaultHandleDragEvent);
        layerDiv.addEventListener('drop', this.onDrop);
      }
    }
  }

  // drag and drop [end] -------------------------------------------------------

}
