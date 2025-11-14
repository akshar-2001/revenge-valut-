
import React, { useState } from 'react';
import { Subject, SubjectContent } from '../types';
import { PlusIcon, TrashIcon, BookOpenIcon } from './Icons';

interface SubjectsViewProps {
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onUpdateSubjectContent: (id: string, content: SubjectContent) => void;
  onDeleteSubject: (id: string) => void;
}

const SubjectCard: React.FC<{ subject: Subject, onUpdate: (content: SubjectContent) => void, onDelete: () => void }> = ({ subject, onUpdate, onDelete }) => {
  const [content, setContent] = useState<SubjectContent>({
    transcripts: subject.transcripts,
    pdfs: subject.pdfs,
    pyqs: subject.pyqs,
  });

  const handleContentChange = (field: keyof SubjectContent, value: string) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
    onUpdate(newContent);
  };
  
  const contentStatus = (text: string) => text.length > 0 ? 'text-success' : 'text-gray-500';

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col space-y-4 transition-all duration-300 hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <BookOpenIcon className="w-6 h-6 mr-3 text-primary" />
          {subject.name}
        </h3>
        <button onClick={onDelete} className="text-gray-400 hover:text-danger transition-colors">
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className='flex space-x-4 text-sm font-medium'>
         <span className={contentStatus(content.transcripts)}>Transcripts</span>
         <span className={contentStatus(content.pdfs)}>PDFs</span>
         <span className={contentStatus(content.pyqs)}>PYQs</span>
      </div>

      <div className="space-y-4">
        <textarea
          value={content.transcripts}
          onChange={(e) => handleContentChange('transcripts', e.target.value)}
          placeholder="Paste lecture transcripts here..."
          className="w-full h-24 p-2 bg-background border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <textarea
          value={content.pdfs}
          onChange={(e) => handleContentChange('pdfs', e.target.value)}
          placeholder="Paste key content from rapid revision PDFs here..."
          className="w-full h-24 p-2 bg-background border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <textarea
          value={content.pyqs}
          onChange={(e) => handleContentChange('pyqs', e.target.value)}
          placeholder="Paste Previous Year Questions (PYQs) for style mimicking..."
          className="w-full h-24 p-2 bg-background border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>
    </div>
  );
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({ subjects, onAddSubject, onUpdateSubjectContent, onDeleteSubject }) => {
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName('');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-primary">My Knowledge Vault</h1>
      
      <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a New Subject</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="e.g., Cardiology"
            className="flex-grow p-3 bg-background border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            onClick={handleAddSubject}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/80 transition-all duration-300 disabled:bg-gray-500"
            disabled={!newSubjectName.trim()}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Subject
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onUpdate={(content) => onUpdateSubjectContent(subject.id, content)}
            onDelete={() => onDeleteSubject(subject.id)}
          />
        ))}
      </div>
       {subjects.length === 0 && (
         <div className="text-center col-span-full py-16 px-4 bg-surface rounded-lg">
           <BookOpenIcon className="w-16 h-16 mx-auto text-gray-500" />
           <h3 className="mt-4 text-xl font-semibold text-text-secondary">Your vault is empty</h3>
           <p className="mt-2 text-gray-400">Add your first subject to start generating MCQs.</p>
         </div>
       )}
    </div>
  );
};
