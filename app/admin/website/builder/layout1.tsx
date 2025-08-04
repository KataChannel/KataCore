import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Định nghĩa type cho các phần tử
interface Element {
  id: string;
  type: 'text' | 'image' | 'button';
  content: string;
  styles?: {
    fontSize?: string;
    color?: string;
    width?: string;
    height?: string;
  };
}

// Component chính
const WebsiteBuilder: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Thêm phần tử mới
  const addElement = (type: 'text' | 'image' | 'button') => {
    const newElement: Element = {
      id: uuidv4(),
      type,
      content: type === 'text' ? 'New Text' : 
               type === 'image' ? '/placeholder.png' : 
               'Click Me',
      styles: {
        fontSize: '16px',
        color: '#000000',
        width: type === 'image' ? '200px' : undefined,
        height: type === 'image' ? '200px' : undefined,
      },
    };
    setElements([...elements, newElement]);
  };

  // Xử lý kéo thả
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedElements = Array.from(elements);
    const [movedElement] = reorderedElements.splice(result.source.index, 1);
    reorderedElements.splice(result.destination.index, 0, movedElement);

    setElements(reorderedElements);
  };

  // Cập nhật nội dung phần tử
  const updateElementContent = (id: string, content: string) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, content } : el
    ));
  };

  // Cập nhật style phần tử
  const updateElementStyle = (id: string, style: Partial<Element['styles']>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, styles: { ...el.styles, ...style } } : el
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Thêm phần tử</h2>
        <Button className="w-full mb-2" onClick={() => addElement('text')}>
          Thêm Text
        </Button>
        <Button className="w-full mb-2" onClick={() => addElement('image')}>
          Thêm Hình ảnh
        </Button>
        <Button className="w-full" onClick={() => addElement('button')}>
          Thêm Button
        </Button>
      </div>

      {/* Canvas */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="canvas">
          {(provided) => (
            <div 
              className="flex-1 p-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {elements.map((element, index) => (
                <Draggable key={element.id} draggableId={element.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 mb-4 bg-white rounded shadow ${
                        selectedElement === element.id ? 'border-2 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      {element.type === 'text' && (
                        <p style={element.styles}>{element.content}</p>
                      )}
                      {element.type === 'image' && (
                        <img 
                          src={element.content} 
                          alt="content" 
                          style={element.styles}
                          className="object-cover"
                        />
                      )}
                      {element.type === 'button' && (
                        <button 
                          style={element.styles}
                          className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                          {element.content}
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-64 bg-white p-4 shadow-lg">
          <h2 className="text-lg font-bold mb-4">Thuộc tính</h2>
          {elements.find(el => el.id === selectedElement)?.type === 'text' && (
            <>
              <Input
                className="mb-2"
                placeholder="Nội dung"
                value={elements.find(el => el.id === selectedElement)?.content}
                onChange={(e) => updateElementContent(selectedElement, e.target.value)}
              />
              <Input
                className="mb-2"
                placeholder="Kích thước chữ"
                value={elements.find(el => el.id === selectedElement)?.styles?.fontSize}
                onChange={(e) => updateElementStyle(selectedElement, { fontSize: e.target.value })}
              />
              <Input
                type="color"
                className="mb-2"
                value={elements.find(el => el.id === selectedElement)?.styles?.color}
                onChange={(e) => updateElementStyle(selectedElement, { color: e.target.value })}
              />
            </>
          )}
          {elements.find(el => el.id === selectedElement)?.type === 'image' && (
            <>
              <Input
                className="mb-2"
                placeholder="URL hình ảnh"
                value={elements.find(el => el.id === selectedElement)?.content}
                onChange={(e) => updateElementContent(selectedElement, e.target.value)}
              />
              <Input
                className="mb-2"
                placeholder="Chiều rộng"
                value={elements.find(el => el.id === selectedElement)?.styles?.width}
                onChange={(e) => updateElementStyle(selectedElement, { width: e.target.value })}
              />
              <Input
                className="mb-2"
                placeholder="Chiều cao"
                value={elements.find(el => el.id === selectedElement)?.styles?.height}
                onChange={(e) => updateElementStyle(selectedElement, { height: e.target.value })}
              />
            </>
          )}
          {elements.find(el => el.id === selectedElement)?.type === 'button' && (
            <Input
              className="mb-2"
              placeholder="Nội dung button"
              value={elements.find(el => el.id === selectedElement)?.content}
              onChange={(e) => updateElementContent(selectedElement, e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteBuilder;