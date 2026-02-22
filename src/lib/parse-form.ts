import { NextRequest } from 'next/server';
import formidable from 'formidable';

export const parseForm = async (
  req: NextRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const formData = await req.formData();
    const fields: Record<string, string[]> = {};
    const files: Record<string, formidable.File[]> = {};
    
    for (const [key, value] of formData.entries()) {
        // Use `File` instead of `Blob` to get access to `.name`
        if (value instanceof File) {
            const file: formidable.File = {
                size: value.size,
                // Web API Files don't have paths. 
                // If you need a real path, you must use `fs` to write it to disk first.
                filepath: '', 
                originalFilename: value.name,
                newFilename: value.name,
                mimetype: value.type,
                mtime: new Date(), // mtime cannot be null in newer formidable versions
                hashAlgorithm: false,
                destroy: () => {}, // Mock destroy function
                toJSON: () => ({
                    size: value.size,
                    filepath: '',
                    originalFilename: value.name,
                    newFilename: value.name,
                    mimetype: value.type,
                    mtime: new Date(),
                    length: value.size
                })
            } as formidable.File; // Cast to ensure compatibility with formidable strict types

            if (files[key]) {
                files[key].push(file);
            } else {
                // Formidable v3+ usually stores files in arrays by default
                files[key] = [file];
            }
        } else {
            // Formidable v3+ stores fields in arrays
            if (fields[key]) {
                fields[key].push(value.toString());
            } else {
                fields[key] = [value.toString()];
            }
        }
    }

    return { 
        fields: fields as formidable.Fields, 
        files: files as formidable.Files 
    };
};