import { Plugin } from 'obsidian';

/**
 * Table Sticky Header Plugin
 * 
 * 修复问题：
 * 1. 宽度对齐 - 使用 getBoundingClientRect 精确同步
 * 2. 样式一致 - 继承原表格样式
 * 3. 横向滚动 - 克隆容器跟随水平滚动容器，而非 translateX
 * 4. 窄表格 - 克隆容器宽度跟随表格实际宽度
 */
export default class TableStickyHeaderPlugin extends Plugin {
    private mutationObserver: MutationObserver | null = null;
    private processedTables: WeakSet<HTMLTableElement> = new WeakSet();
    private cleanupFunctions: Map<HTMLTableElement, () => void> = new Map();

    async onload() {
        this.app.workspace.onLayoutReady(() => {
            this.processAllTables();
        });

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                setTimeout(() => this.processAllTables(), 200);
            })
        );

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                setTimeout(() => this.processAllTables(), 200);
            })
        );

        this.mutationObserver = new MutationObserver(() => {
            this.processAllTables();
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    onunload() {
        this.cleanupFunctions.forEach((cleanup) => cleanup());
        this.cleanupFunctions.clear();
        document.querySelectorAll('.tsh-clone-wrapper').forEach((el) => el.remove());
        this.mutationObserver?.disconnect();
    }

    private processAllTables() {
        const tables = document.querySelectorAll<HTMLTableElement>(
            '.markdown-reading-view table, .markdown-preview-view table, .cm-table-widget table'
        );

        tables.forEach((table) => {
            if (!this.processedTables.has(table) && !table.closest('.tsh-clone-wrapper')) {
                // Skip tables inside markmap views (side panel SVG or inline markmap)
                if (table.closest('.markmap') || table.closest('[data-type="myMarkmap"]') || table.closest('foreignObject')) return;
                this.setupStickyHeader(table);
                this.processedTables.add(table);
            }
        });
    }

    private setupStickyHeader(table: HTMLTableElement) {
        const thead = table.querySelector('thead');
        if (!thead) return;

        // 找到滚动容器
        const scrollContainer = this.findVerticalScrollContainer(table);
        if (!scrollContainer) return;

        // 找到水平滚动的父容器
        const hScrollContainer = this.findHorizontalScrollContainer(table);

        // 创建克隆结构
        const wrapper = document.createElement('div');
        wrapper.className = 'tsh-clone-wrapper';

        const scroller = document.createElement('div');
        scroller.className = 'tsh-clone-scroller';
        wrapper.appendChild(scroller);

        // 克隆表格
        const clonedTable = table.cloneNode(true) as HTMLTableElement;
        clonedTable.removeAttribute('data-sticky-header-initialized');
        scroller.appendChild(clonedTable);

        document.body.appendChild(wrapper);

        // 更新逻辑
        const update = () => {
            // 检查表格是否还在 DOM 中
            if (!document.body.contains(table)) {
                wrapper.classList.remove('tsh-visible');
                return;
            }

            const tableRect = table.getBoundingClientRect();
            const theadRect = thead.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();

            // 获取当前 leaf 容器，确保不超出范围
            const leafContent = table.closest('.workspace-leaf-content');
            const leafRect = leafContent?.getBoundingClientRect();

            const headerHeight = theadRect.height;
            const topBoundary = containerRect.top;

            // 判断是否需要 sticky
            const shouldStick = theadRect.top < topBoundary &&
                tableRect.bottom > topBoundary + headerHeight;

            if (shouldStick) {
                wrapper.classList.add('tsh-visible');

                // 同步列宽（精确复制每个单元格宽度）
                this.syncColumnWidths(table, clonedTable);

                // 计算可见区域
                let visibleLeft = tableRect.left;
                let visibleWidth = tableRect.width;

                // 如果有 leaf 边界，裁剪到 leaf 范围内
                if (leafRect) {
                    const clippedLeft = Math.max(tableRect.left, leafRect.left);
                    const clippedRight = Math.min(tableRect.right, leafRect.right);
                    visibleLeft = clippedLeft;
                    visibleWidth = Math.max(0, clippedRight - clippedLeft);
                }

                // 设置 wrapper 位置和大小（这是可见区域）
                wrapper.style.top = `${topBoundary}px`;
                wrapper.style.left = `${visibleLeft}px`;
                wrapper.style.width = `${visibleWidth}px`;
                wrapper.style.height = `${headerHeight}px`;

                // scroller 需要容纳整个表格宽度
                scroller.style.width = `${tableRect.width}px`;

                // 通过 margin-left 模拟水平滚动偏移
                // 偏移量 = 表格实际左边界 - 可见区域左边界
                const offsetX = tableRect.left - visibleLeft;
                scroller.style.marginLeft = `${offsetX}px`;

            } else {
                wrapper.classList.remove('tsh-visible');
            }
        };

        // 事件处理
        const scrollHandler = () => requestAnimationFrame(update);

        scrollContainer.addEventListener('scroll', scrollHandler, { passive: true });
        if (hScrollContainer && hScrollContainer !== scrollContainer) {
            hScrollContainer.addEventListener('scroll', scrollHandler, { passive: true });
        }
        window.addEventListener('resize', scrollHandler, { passive: true });

        // 定期检查（应对动态内容变化）
        const intervalId = setInterval(update, 500);

        // 初始更新
        setTimeout(update, 100);

        // 清理函数
        this.cleanupFunctions.set(table, () => {
            scrollContainer.removeEventListener('scroll', scrollHandler);
            if (hScrollContainer) {
                hScrollContainer.removeEventListener('scroll', scrollHandler);
            }
            window.removeEventListener('resize', scrollHandler);
            clearInterval(intervalId);
            wrapper.remove();
        });
    }

    private findVerticalScrollContainer(element: HTMLElement): HTMLElement | null {
        let current: HTMLElement | null = element.parentElement;
        while (current) {
            if (current.classList.contains('markdown-preview-view') ||
                current.classList.contains('cm-scroller') ||
                current.classList.contains('view-content')) {
                return current;
            }
            const style = window.getComputedStyle(current);
            if ((style.overflowY === 'auto' || style.overflowY === 'scroll') &&
                current.scrollHeight > current.clientHeight) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    private findHorizontalScrollContainer(element: HTMLElement): HTMLElement | null {
        let current: HTMLElement | null = element.parentElement;
        while (current) {
            const style = window.getComputedStyle(current);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
                return current;
            }
            if (current.classList.contains('cm-table-widget') ||
                current.classList.contains('cm-embed-block')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    private syncColumnWidths(source: HTMLTableElement, target: HTMLTableElement) {
        // 同步 thead 单元格宽度
        const sourceTh = source.querySelectorAll('thead th, thead td');
        const targetTh = target.querySelectorAll('thead th, thead td');

        sourceTh.forEach((cell, i) => {
            if (targetTh[i]) {
                const rect = (cell as HTMLElement).getBoundingClientRect();
                const th = targetTh[i] as HTMLElement;
                th.setCssStyles({
                    width: `${rect.width}px`,
                    minWidth: `${rect.width}px`,
                    maxWidth: `${rect.width}px`,
                    boxSizing: 'border-box',
                });
            }
        });

        // 同步表格总宽度
        const sourceRect = source.getBoundingClientRect();
        target.setCssStyles({
            width: `${sourceRect.width}px`,
            minWidth: `${sourceRect.width}px`,
        });
    }
}
