// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: folder-open;
/*!
 * DirExplorer.js
 *
 * Copyright (c) ©︎ 2021 Kynako
 *
 * This software is released under the MIT license.
 * See https://github.com/Kynako/DirExplorer/blob/main/LICENSE
*/

/* How to use
   const fm = FileManager.iCloud()
   const root = fm.documentsDirectory()
   const direx = new DirExplorer()
   let data = direx.process(root)
   let tree = direx.tree(data)   
   // also you can use `present` option parameter.
   direx.tree(data, true)

*/
class DirExplorer {
  constructor(){
    this.fm = FileManager.iCloud()
    this.tab   = '   '
    this.Iline = '│  '
    this.Tline = '├─ '
    this.Lline = '└─ '
    this.op = []
  }
  
  debug(data){
    data.forEach((datum)=>{
      let tab = '  '.repeat(datum.hierarky)
      if(datum.isDir){
        console.warn(`${tab}${datum.name}/`)
        this.debug(datum.contents)
      } else {
        console.log(`${tab}${datum.name}`)
      }
    })
  }
  
  tree(data, present=false, tab='', isRoot=true){

    if(isRoot == true){
      let root = data[0].name + (data[0].isDir 
        ? '/' : '')
      let branches = data[0].isDir
        ? this.tree(
            data[0].contents, false, '', false
          )
        : null
      let tree = [root, branches]
        .flat(Infinity)
        .join('\n')
      present ? console.log(tree) : null
      return tree
    }
    let fileList = data.filter(d => !d.isDir)
    let dirList = data.filter(d => d.isDir)
    let fTree = fileList.map((file, idx, fileList)=>{
      if(idx != fileList.length-1){
        let text = tab+this.Tline+file.name
        // console.log(text)
        return text
      } else if(dirList.length == 0){
        let text = tab+this.Lline+file.name
        // console.log(text)
        return text
      } else {
        let text = tab+this.Tline+file.name
        // console.log(text)
        return text
      }
    })
    let dTree = dirList.map((dir, idx, dirList)=>{
      if(idx != dirList.length-1){
        let text = tab+this.Tline+dir.name+'/'
        // console.log(text)
        return [
          text,
          this.tree(
            dir.contents, false, tab+this.Iline, false
          )
        ]
      } else {
        let text = tab+this.Lline+dir.name+'/'
        // console.log(text)
        return [
          text,
          this.tree(
            dir.contents, false, tab+this.tab, false
          )
        ]
      }
    })
    let branches = [fTree, dTree]
      .flat(Infinity).filter((arr)=>{
        return arr.length != 0
      })
    return branches
  }
  
  _compile(a, b){
    if((a.isDir == true)&&(b.isDir == true)){
      return a.name > b.name
    } else if((a.isDir == true)&&(b.isDir == false)){
      return 1
    } else if((a.isDir == false)&&(b.isDir == true)){
      return -1
    } else if((a.isDir == false)&&(b.isDir == false)){
      return a.name > b.name
    } else {
      console.error([a, b])
    }
  }
  
  process(path, hierarky=0, main=true){
    if(main == true){
      // root datum
      return [{
        isDir: this.fm.isDirectory(path),
        path: path,
        name: this.fm.fileName(path, true),
        hierarky: 0,
        contents: this.process(path, hierarky, false)
      }]
    } else {
      if(!this.fm.isDirectory(path)){
        return null
      } else {
        let contents = this.fm.listContents(path);
        return contents.map((content)=>{
          let childPath = this.fm.joinPath(
            path, content
          );
          if(this.fm.isDirectory(childPath)){
            // dir
            return {
              isDir: true,
              path: childPath,
              name: this.fm.fileName(childPath, true),
              hierarky: hierarky,
              contents: this.process(
                childPath, hierarky+1, false
              )
            };
          } else {
            // file
            return {
              isDir: false,
              path: childPath,
              name: this.fm.fileName(
                childPath, true),
              hierarky: hierarky,
              contents: null
            };
          };
        }).sort(this._compile)
      }
    }
  }
}
module.exports = DirExplorer;