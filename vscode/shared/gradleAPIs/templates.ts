'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';
import { IExampleTemplateAPI, IExampleTemplateCreator } from './externalapi';
import { generateCopy } from '../generator';

interface JsonLayout {
  name: string;
  description: string;
  tags: string[];
  foldername: string;
}

export class Templates {
  private readonly exampleResourceName = 'javatemplates.json';

  constructor(resourceRoot: string, language: string, core: IExampleTemplateAPI) {
    const templatesFolder = path.join(resourceRoot, 'src', 'templates');
    const resourceFile = path.join(templatesFolder, this.exampleResourceName);
    const gradleFolder = path.join(resourceRoot, 'gradlebase');
    fs.readFile(resourceFile, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const templates: JsonLayout[] = jsonc.parse(data);
      for (const e of templates) {
        const provider: IExampleTemplateCreator = {
          getLanguage(): string {
            return language;
          },
          getDescription(): string {
            return e.description;
          },
          getDisplayName(): string {
            return e.name;
          },
          async generate(folderInto: vscode.Uri): Promise<boolean> {
            try {
              await generateCopy(vscode.Uri.file(path.join(templatesFolder, e.foldername)),
                vscode.Uri.file(gradleFolder), folderInto);
            } catch (err) {
              console.log(err);
              return false;
            }
            return true;
          }
        };
        core.addTemplateProvider(provider);
      }
    });
  }

  public dispose() {

  }
}