syntax on
execute pathogen#infect()
filetype plugin indent on
set number
set hidden
set background=dark
set fillchars+=vert:\ 


highlight clear SignColumn
highlight GitGutterAdd ctermfg=2
highlight GitGutterChange ctermfg=3
highlight GitGutterDelete ctermfg=1
highlight GitGutterChangeDelete ctermfg=4
highlight! link SignColumn LineNr


" Move to the next buffer
"
nmap gl :bnext<CR>

" Move to the previous buffer
nmap gh :bprevious<CR>

" Close the current buffer and move to the previous one
" This replicates the idea of closing a tab
nmap gq :bp <BAR> bd #<CR>

nmap g1 :VemTablineGo 1<CR>
nmap g2 :VemTablineGo 2<CR>
nmap g3 :VemTablineGo 3<CR>
nmap g4 :VemTablineGo 4<CR>
nmap g5 :VemTablineGo 5<CR>
nmap g6 :VemTablineGo 6<CR>
nmap g7 :VemTablineGo 7<CR>
nmap g8 :VemTablineGo 8<CR>
nmap g9 :VemTablineGo 9<CR>

hi VertSplit ctermfg=NONE ctermbg=NONE cterm=NONE
hi HoriSplit ctermfg=NONE ctermbg=NONE cterm=NONE
hi TabLine ctermfg=NONE ctermbg=NONE cterm=NONE
hi TabLineFill ctermfg=NONE ctermbg=NONE cterm=NONE
hi TabLineSel ctermfg=black ctermbg=magenta cterm=NONE

hi CursorLine cterm=NONE ctermbg=NONE ctermfg=NONE guibg=black guifg=NONE
hi CursorLineNR cterm=NONE ctermbg=NONE ctermfg=NONE guibg=black guifg=NONE

map <C-n> :NERDTreeToggle<CR>
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif

set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*

let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

let g:airline_theme='bubblegum'

"folding settings
set foldmethod=indent   "fold based on indent
set foldnestmax=10      "deepest fold is 10 levels
set nofoldenable        "dont fold by default
set foldlevel=1         "this is just what i use

filetype plugin indent on
" show existing tab with 4 spaces width
set tabstop=4
" " when indenting with '>', use 4 spaces width
set shiftwidth=4
" " On pressing tab, insert 4 spaces
set expandtab

set backspace=2 " make backspace work like most other apps"
set mouse=a

if !has("gui_running")
    set t_Co=256
    set term=screen-256color
endif

