# 一、Git

## 1、常用git 命令？

```js
git init                     // 新建 git 代码库
git add                      // 添加指定文件到暂存区
git rm                       // 删除工作区文件，并且将这次删除放入暂存区
git commit -m [message]      // 提交暂存区到仓库区
git commit --amend           // 修改提交记录文案
git branch                   // 列出所有分支
git checkout -b [branch]     // 新建一个分支，并切换到该分支
git branch -D [branch]       // 删除本地分支
git push origin --delete     // 删除远程分支
git status                   // 显示有变更文件的状态
git stash                    // 储存内容临时空间
git revert                   // 重置提交 是用一次新的 commit 来回滚（重做）之前的 commit
git reset                    // 恢复提交  是直接删除指定的 commit
git rebase                   // 分支变基 变基是将一系列提交移动或组合到新的基本提交的过程
git cherry-pick              // 把另一个分支的一条记录或者多条记录拿到当前分支
```

## 2、git pull 和 git fetch 区别

- git fetch 只是将远程仓库的变化下载下来，并没有和本地分支合并。
- git pull 会将远程仓库的变化下载下来，并和当前分支合并  git fetch + git merge (默认方式)

## 3、git rebase 和 git merge 的区别

git merge 和 git rebase 都是用于分支合并，关键**在commit 记录的处理上不同**：

- git merge 会新建一个新的 commit 对象，然后两个分支以前的 commit 记录都指向这个新 commit 记录。这种方法会保留之前每个分支的 commit 历史。
- git rebase 会先找到两个分支的第一个共同的 commit 祖先记录，然后将提取当前分支这之后的所有 commit 记录，然后将这个 commit 记录添加到目标分支的最新提交后面。经过这个合并后，两个分支合并后的 commit 记录就变为了线性的记录了。

## 4、使用git rebase构建清晰版本记录
> [**使用git rebase构建清晰版本记录**](https://mp.weixin.qq.com/s?__biz=MzUyMTg1OTE2MQ==&mid=2247484246&idx=1&sn=9490c8d7c7fc8f7304447e2bca0f0722&chksm=f9d5fa60cea2737642f6557100fcac67525aa846127a90fbb212d0fd8c040a9de43fdf9bba7a&token=1739500914&lang=zh_CN#rd)



