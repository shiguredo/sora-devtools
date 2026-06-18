import { loadMp4MediaStream } from "@/mp4MediaStream";

import { isFormDisabled, localMediaStream, mediaType, setMp4MediaStream } from "@/app/signals";
import { FormGroup, FormInput } from "@/components/ui";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function Mp4FileForm() {
  const disabled = localMediaStream.value !== null || isFormDisabled.value;
  const onChange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement;
    const { files } = target;
    if (files === null || files.length === 0) {
      return;
    }

    // MP4 ファイルをロードする
    try {
      const mp4MediaStream = await loadMp4MediaStream(files[0]);
      setMp4MediaStream(mp4MediaStream);
    } catch (error) {
      // ロードに失敗したらファイル選択をクリアする
      target.value = "";

      // 以前の内容が残っていた場合に備えて null を入れておく
      setMp4MediaStream(null);

      throw error;
    }
  };
  if (mediaType.value !== "mp4Media") {
    return null;
  }
  return (
    <FormGroup className="flex items-center gap-2" controlId="mp4File">
      <TooltipFormLabel kind="mp4File">mp4File:</TooltipFormLabel>
      <FormInput type="file" accept="video/mp4" disabled={disabled} onChange={onChange} />
    </FormGroup>
  );
}
