<script lang="ts">
    var exports = {};
    import { filedrop } from "filedrop-svelte";
    import type { Files, FileDropOptions } from "filedrop-svelte";

    import { Sample } from "sheet-handle";
    import { getColumnConfig, rows } from "../../stores";

    enum Status {
        NoFile = <any>"Please upload a file",
        Selected = <any>"File selected and ready to parse",
        Loaded = <any>"File loaded and ready for scrutiny",
        Error = <any>"ERROR",
    }
    type StatusStr = keyof typeof Status;
    let options: FileDropOptions = {
        multiple: false,
        accept: [".xlsx", ".xls", ".xlsb", ".ods"],
        windowDrop: true,
    };
    let file: Blob;
    let fileName: string = "[Please Upload a Workbook]";
    let status = Status.NoFile;
    let reader: FileReader;

    async function upload() {
        reader = reader || new FileReader();
        const buff = await file.arrayBuffer();
        console.log(file.type);

        console.log(buff.byteLength);
        const res = Sample.fromBlob(buff as any, getColumnConfig());
        rows.set(res);
        console.log(res);
        fileName = fileName + "\t LOADED";
        status = Status.Loaded;
    }

    function onFileDrop(e: any) {
        file = e.detail.files.accepted[0];
        fileName = (file as any).path;
        status = Status.Selected;
    }
</script>

<div use:filedrop={options} on:filedrop={onFileDrop}>
    Upload Input SpreadSheet
    <br />
    File: {fileName}
    <br />
    <span class={Status[status]}>{status}</span>
    <br />
</div>
<button disabled={!file} on:click={upload}>Upload and Parse</button>

<style>
    div {
        border: 2px solid green;
    }
    .NoFile {
        color: cadetblue;
    }
    .Selected {
        color: cadetblue;
    }
    .Loaded {
        color: green;
        font-weight: bold;
    }
    .Error {
        color: red;
        font-weight: bold;
    }
</style>
