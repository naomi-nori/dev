" Vundle and plugin configuration
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'
Plugin 'valloric/youcompleteme'
Plugin 'ctrlpvim/ctrlp.vim'
Plugin 'raimondi/delimitmate'
Plugin 'ekalinin/dockerfile.vim'
Plugin 'scrooloose/nerdtree'
Plugin 'scrooloose/syntastic'
Plugin 'vim-airline/vim-airline'
Plugin 'vim-airline/vim-airline-themes'
Plugin 'arzg/vim-colors-xcode'
Plugin 'ryanoasis/vim-devicons'
Plugin 'tpope/vim-fugitive'
Plugin 'airblade/vim-gitgutter'
Plugin 'pangloss/vim-javascript'
Plugin 'tpope/vim-surround'
Plugin 'pacha/vem-tabline'
Plugin 'floobits/floobits-neovim'
Plugin 'philrunninger/nerdtree-visual-selection'


" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required

" re-read files if changed outside vim
set autoread

" no case-sesative search unless uppercase is present
set ignorecase
set smartcase

" enable mouse scroll
set mouse=a

" allow new buffer to be opened with out saving current
set hidden

" tab settings
set expandtab
set tabstop=4
set softtabstop=4
set shiftwidth=4
set backspace=2 " make backspace work like most other apps"
set smarttab
set smartindent
set shiftround

" enable syntax highlighting
syntax on

" matching braces/tags
set showmatch

" line wrapping
set wrap

" turn on detection for filetypes, indentation files, and plubinfiles
filetype plugin indent on

" show next 3 lines while scrolling
if !&scrolloff
set scrolloff=3
endif

" show next 5 columns while side scrolling
if !&sidescrolloff
set sidescrolloff=5
endif

" jump to last known position when reopening file
if has("autocmd")
au BufReadPost * if line("'\"") > 0 && line("'\"") <= line("$")
\| exe "normal! g'\"" | endif
endif

" relative number lines
set number
set relativenumber
"augroup numbertoggle
"    autocmd!
"    autocmd BufEnter,FocusGained,InsertLeave * set relativenumber
"    autocmd BufLeave,FocusLost,InsertEnter * set norelativenumber
"augroup END

" delete all trailing whitespace on save
autocmd BufWritePre * %s/\s\+$//e

set background=dark
set fillchars+=vert:\
set backupdir=$TMPDIR//
set directory=$TMPDIR//

colorscheme xcodedark

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

" hi VertSplit ctermfg=NONE ctermbg=NONE cterm=NONE
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

let g:syntastic_ruby_mri_exec = '/usr/local/opt/ruby@2.6/bin/ruby'
let g:syntastic_quiet_messages = { 'regex': 'method redefined\|previous definition of'}

let g:airline_theme='minimalist'

"folding settings
set foldmethod=indent   "fold based on indent
set foldnestmax=10      "deepest fold is 10 levels
set nofoldenable        "dont fold by default
set foldlevel=1         "this is just what i use

if !has("gui_running")
    set t_Co=256
    " set term=screen-256color
endif
