# 开发规范

## [会议](./meeting.html)

Headers automatically get anchor links applied. Rendering of anchors can be configured using the [`markdown.anchor`]option.

## 开发

## 测试

## 部署发布

Inbound links ending in `.md` or `.html` are converted to `<router-link>` for SPA navigation.

Each sub-directory in your static site should contain a `README.md`. It will automatically be converted to `index.html`.

::: tip
When writing the relative path to a directory's `index.html`, don't forget to close it off with a `/`, otherwise you will get a 404. For example, use `/config/` instead of `/config`.
:::
