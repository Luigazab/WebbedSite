import { Edit, MessageCircleMore, Send, ThumbsUp } from "lucide-react";

export default function ProjectModal({ isOpen, onClose, title, description, srcDoc }) {
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="grid-[2fr,1fr] gap-2">
        <iframe srcDoc={srcDoc}/>
        <div className="flex flex-col space-y-4 justify-between h-full">
          <div className="flex flex-col">
            <h3 className="font-bold text-2xl">{title}</h3>
            <div>
              <p className="text-green-500">{likes}<ThumbsUp/></p>
              <p className="text-orange-500">{comments}<MessageCircleMore/></p>
            </div>
            <p className="font-semibold text-md">{description}</p>
          </div>
          <div className="grid-[2fr, 1fr]">
            <button className="bg-blue-700 text-white font-bold"><Edit/> Edit</button>
            <button className="bg-orange-600 text-white font-bold"><Send/> Post in Gallery</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}