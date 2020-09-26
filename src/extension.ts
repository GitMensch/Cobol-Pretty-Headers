'use strict';

import * as vscode from 'vscode';

type HeaderRecord = {
	title: string,
	data: string[]
};

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.generateHeaderCode', function () {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		

		if (editor) {
			// start off by getting the document in the current editor and all the text in the document
			const document = editor.document;
			const allText = document.getText();

			// Split the text into individual lines
			const allLines = allText.split("\n");
			console.log(allLines);
			
			editor.edit(editBuilder => {
				const pos = new vscode.Position(allLines.length,0);
				

				function getTitle(text: string[]) {
					for (let i = 0; i < text.length; i++) {
						if(text[i].trim().length != 0) {
							return text[i];
						}
					}
				}
				
				// create our own type called headerRecord and give it the title and data, then we can iterate a list of them to write them to 
				//the text document

				function processLine(line: string): HeaderRecord  {
					const parts = line.split(/(\s+)/);
					const title: string = getTitle(parts) + '-HDR';
					const data: string[] = [];
					parts.forEach(part => {
						if (part.length != 0) {
							data.push('\n\t05 FILLER	PIC X(' + part.length +')\tVALUE ' 
						+ (!part.trim().length ? "SPACES" : '"'+ part+ '"'));
						}
					});
					const h: HeaderRecord = {title: title, data: data};
					return h;
				}

				function processHeader(lines: string[]): HeaderRecord[] {
					const headerData: HeaderRecord[] = [];
					lines.forEach( line => {
						const processedLine = processLine(line);
						headerData.push(processedLine);
					});
					return headerData;
				}

				function generateDataFields(headerData: HeaderRecord[]) {
					headerData.forEach(hData => {
						editBuilder.insert(pos, hData.title + ".");
						for (let i = 0; i < hData.data.length; i++) {
								editBuilder.insert(pos, hData.data[i]);
						}
						editBuilder.insert(pos,'\n\n');	
					});
				}

				function generateCode() {
					const header = processHeader(allLines);
					for (let i = 0; i < header.length; i++) {
						editBuilder.insert(pos,'\n');
					}
					generateDataFields(header);
					generateWriter(header);
				}

				function generateWriter(headerData: HeaderRecord[]) {
					editBuilder.insert(pos,'\n');
					editBuilder.insert(pos, '\nwrite-hdrs.');
					for (let i = 0; i < headerData.length; i++) {
						if (i === 0) {
							editBuilder.insert(pos, "\nWRITE 'output' FROM " + headerData[i].title + '\n\t AFTER ADVANCING PAGE');
						}
						else {
							editBuilder.insert(pos, "\nWRITE 'output' FROM " + headerData[i].title + '\n\t AFTER ADVANCING 1 LINE');
						}
					}
				}
				generateCode();
			});
		}
	});

	context.subscriptions.push(disposable);
}