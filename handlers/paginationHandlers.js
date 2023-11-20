
class Pagination {
  base_url = ''; // 기본 연결링크
  page_rows = 0; // 한페이지에 출력할 Row 수
  total_rows = 0; // 총 Row수
  display_always = true; // 페이지가 1페이지만 있어도 출력할건지 여부 
  fixed_page_num = 5; // 한번에 표시할 페이지 수
  startnum = 0; //시작 row 번호
  classname = ''; //전체 Css class

  page = 1; //현재 페이지

  aRowLength = [10, 25, 50, 100];

  constructor(params) {

    for (const [key, value] of Object.entries(params)) {
      this[key] = value;
    }

    this.first_link = '처음'; // [처음] 버튼에 표시할 문자
    this.next_link = '&rang;'; // [다음] 버튼에 표시할 문자
    this.prev_link = '&lang;'; // [이전] 버튼에 표시할 문자
    this.next10_link = '&Rang;'; // [다음] 버튼에 표시할 문자
    this.prev10_link = '&Lang;'; // [이전] 버튼에 표시할 문자
    this.last_link = '끝'; // [마지막] 버튼에 표시할 문자
    
    this.full_tag_open = '<ul class="pagination classname">'; // 전체를 감싸는 여는 태그
    this.full_tag_close = '</ul>'; // 전체를 감싸는 닫는 태그
    this.item_tag_open = '<li class="page-item">'; // 각 페이지 링크 여는 태그
    this.item_tag_close = '</li>'; // 각 페이지 링크 닫는 태그
    this.cur_tag_open = '<li class="page-item active">';        // 현재 페이지 링크 여는 태그
    this.cur_tag_close = "</li>"; // 현재 페이지 링크 닫는 태그
    
    this.first_tag_open = '<li class="page-item">';
    this.first_tag_close = '</li>';
    this.last_tag_open = '<li class="page-item">';
    this.last_tag_close = '</li>';
    this.next_tag_open = '<li class="page-item next">';
    this.next_tag_close = '</li>';
    this.prev_tag_open = '<li class="page-item pre">';
    this.prev_tag_close = '</li>';
    this.next10_tag_open = '<li class="page-item next10">';
    this.next10_tag_close = '</li>';
    this.prev10_tag_open = '<li class="page-item pre10">';
    this.prev10_tag_close = '</li>';

    this.page_param   = "pg"; // 파라미터 이름
      
    this.add_param = ""; // 추가 파러미터
    
    this.display_pages = true;
    
    this.disable_first_link   = true; // 현재 페이지가 첫페이지일때 [처음] 링크를 disabled 시킨다..
    this.disable_last_link    = true; // 현재 페이지가 마지막페이지일때 [마지막] 링크를 disabled 시킨다..
    this.disable_prev_link    = true; // 현재 페이지가 처음페이지일때 [이전] 링크를 disabled 시킨다..
    this.disable_next_link    = true; // 현재 페이지가 마지막페이지일때 [다음] 링크를 disabled 시킨다.
    this.disable_prev10_link    = true; // 현재 블럭가 처음블럭일때 [이전10] 링크를 disabled 시킨다..
    this.disable_next10_link    = true; // 현재 블럭이 마지막 블럭일때 [다음10] 링크를 disabled 시킨다.
    
    this.display_first_always = true; // 현재페이지가 첫페이일때 [처음] 링크를 보여준다..
    this.display_last_always  = true; // 현재페이지가 마지막페이지일때 [마지막] 링크를 보여준다..
    this.display_prev_always  = true; // 현재페이지가 첫번째페이지일때 [이전] 링크를 보여준다..
    this.display_next_always  = true; // 현재페이지가 마지막페이지일때 [다음] 링크를 보여준다.
    this.display_prev10_always  = true; // 현재 블럭가 처음블럭일때 [이전10] 링크를 보여준다..
    this.display_next10_always  = true; // 현재 블럭이 마지막 블럭일때 [다음10] 링크를 보여준다.

    this.display_prev10next10 = true;
    
    this.disabled_first_tag_open  = '<li class="page-item disabled">';
    this.disabled_first_tag_close = '</li>';
    this.disabled_last_tag_open   = '<li class="page-item disabled">';
    this.disabled_last_tag_close  = '</a></li>';
    this.disabled_prev_tag_open   = '<li class="page-item pre disabled">';
    this.disabled_prev_tag_close  = '</li>';
    this.disabled_next_tag_open   = '<li class="page-item next disabled">';
    this.disabled_next_tag_close  = '</li>';
    this.disabled_prev10_tag_open   = '<li class="page-item pre10 disabled">';
    this.disabled_prev10_tag_close  = '</li>';
    this.disabled_next10_tag_open   = '<li class="page-item next10 disabled">';
    this.disabled_next10_tag_close  = '</li>';          
  }

  build() {

    // 만약 총 Rows가 0이거나, 한줄당 표시가 0 인경우는 return 한다.
    if (this.total_rows == 0 || this.page_rows == 0) return '';
    
    // 총 몇페이지가 나올지 계산한다
    let num_pages = Math.ceil(this.total_rows / this.page_rows);

    // $display_always 값이 false 이고 페이지가 하나일경우 return 한다.
    if (this.display_always === false && num_pages === 1) return '';

    // 한번에 표시할 페이지수를 체크한다.
    // 값이 잘못되어있다면 아무것도 표시하지 않는다.
    if (this.fixed_page_num < 0) return "";       

    // 앞부분 링크 URL을 만든다. 
    let base_url = this.base_url.trim();
    
    this.cur_page = this.page;        
    
    // 페이지 값이 총 페이지수를 넘지 않는지 확인한다.
    // 만약 더 많다면, 총 페이지값으로 치환해준다.
    if (this.cur_page > num_pages)
    {
      this.cur_page = num_pages;
    }
            
    let uri_page_number = this.cur_page;

    // 시작과 종료 페이지 번호를 얻어온다.     
    let start = (Math.ceil(this.cur_page / this.fixed_page_num) - 1) * this.fixed_page_num + 1 + 1; // Last plus one is for loop statement starts $start - 1 
    let end   = (Math.ceil(this.cur_page / this.fixed_page_num) == Math.ceil(num_pages / this.fixed_page_num)) ? num_pages : Math.ceil(this.cur_page / this.fixed_page_num) * this.fixed_page_num;

    this.startnum = this.page_rows * (this.cur_page - 1);
   
    // Return 할 문자열을 만든다.
    let output = '';

    // [처음으로] 버튼 만들기
    if (this.first_link !== false)
    { 
      if (this.display_first_always === true && this.disable_first_link === true && this.cur_page == 1)
      {
        output += `${this.disabled_first_tag_open}<a href='#' class='page-link'>${this.first_link}</a>${this.disabled_first_tag_close}`;
      }
      else if (this.display_first_always === true || this.cur_page != 1)
      {
        output += `${this.first_tag_open}<a href='javascript:pwUtils.page_move(\"1\")' class='page-link'>${this.first_link}</a>${this.first_tag_close}`;
      }
    }

    // [이전10] 버튼 만들기
    if (this.prev10_link !== false && this.display_prev10next10)
    {
      if (this.display_prev10_always === true && this.disable_prev10_link === true && this.cur_page <= this.fixed_page_num)
      {
        output += `${this.disabled_prev10_tag_open}<a href='#' class='page-link'>${this.prev10_link}</a>${this.disabled_prev10_tag_close}`;
      }
      else if (this.display_prev10_always === true || this.cur_page != 1)
      {
        // 이전페이지 번호를 가져온다. 단, 현재페이지가 1이면, 이전페이지도 1을 가져온다.
        let i = (Math.floor(this.cur_page / this.fixed_page_num) - 1) * this.fixed_page_num + 1;
        
        output += `${this.prev10_tag_open}<a href='javascript:pwUtils.page_move("${i}")' class='page-link'>${this.prev10_link}</a>${this.prev10_tag_close}`;
      }
    }

    // [이전] 버튼 만들기
    if (this.prev_link !== false)
    {
      if (this.display_prev_always === true && this.disable_prev_link === true && this.cur_page == 1)
      {
        output += `${this.disabled_prev_tag_open}<a href='#' class='page-link'>${this.prev_link}</a>${this.disabled_prev_tag_close}`;
      }
      else if (this.display_prev_always === true || this.cur_page != 1)
      {
        // 이전페이지 번호를 가져온다. 단, 현재페이지가 1이면, 이전페이지도 1을 가져온다.
        let i = (uri_page_number == 1) ? 1 : (uri_page_number - 1);
          
        output += `${this.prev_tag_open}<a href='javascript:pwUtils.page_move("${i}")' class='page-link'>${this.prev_link}</a>${this.prev_tag_close}`;
      }
    }

    // 각 페이지 버튼을 만든다.
    if (this.display_pages !== false)
    {           
      for (let loop = start -1; loop <= end; loop++)
      {
        if (loop >= 1)
        {
          if (this.cur_page == loop)
          {
            // 현재 페이지일 경우
            output += `${this.cur_tag_open}<a href='javascript:;;' class='page-link'>${loop}</a>${this.cur_tag_close}`;
          }
          else
          {                       
            output += `${this.item_tag_open}<a href='javascript:pwUtils.page_move("${loop}")' class='page-link'>${loop}</a>${this.item_tag_close}`;
          }
        }
      }
    }

    // 다음으로 버튼을 만든다.
    if (this.next_link !== false)
    {
      if (this.display_next_always === true && this.disable_next_link === true && this.cur_page == num_pages)
      {
        output += `${this.disabled_next_tag_open}<a href='#' class='page-link'>${this.next_link}</a>${this.disabled_next_tag_close}`;
      }
      else if (this.display_next_always === true || this.cur_page != num_pages)
      {
        // 다음페이지를 계산해준다. 현재페이지가 마지막페이지라면, 현재페이지를 세팅
        let i = (this.cur_page == num_pages)? num_pages : this.cur_page + 1;
        
        output += `${this.next_tag_open}<a href='javascript:pwUtils.page_move("${i}")' class='page-link'>${this.next_link}</a>${this.next_tag_close}`;
      }
    }

    // 다음10으로 버튼을 만든다.
    if (this.next10_link !== false && this.display_prev10next10) 
    {
        if (this.display_next10_always === true && this.disable_next10_link === true && end == num_pages)
        {
            output += `${this.disabled_next10_tag_open}<a href='javascript:;' class='page-link'>${this.next10_link}</a>${this.disabled_next10_tag_close}`;
        }
        else if (this.display_next10_always === true || this.cur_page != num_pages)
        {
            // 다음페이지를 계산해준다. 현재페이지가 마지막페이지라면, 현재페이지를 세팅
            let i = end + 1;            
            output += `${this.next10_tag_open}<a href='javascript:pwUtils.page_move("${i}")' class='page-link'>${this.next10_link}</a>${this.next10_tag_close}`;
        }
    }    

    // [마지막으로 페이지를 만든다.]
    if (this.last_link !== false)
    {
      if (this.display_last_always === true && this.disable_last_link === true && this.cur_page == num_pages)
      {
        output += `${this.disabled_last_tag_open}<a href='#' class='page-link'>${this.last_link}</a>${this.disabled_last_tag_close}`;
      }
      else if (this.display_last_always === true || this.cur_page != num_pages)
      {
        output += `${this.last_tag_open}<a href='javascript:pwUtils.page_move("${num_pages}")' class='page-link'>${this.last_link}</a>${this.last_tag_close}`;
      }
    }
    // 완성된 return 값을 정리한다.
    //output = output.replace('#([^:])//+#', '\\1/');
    
    output = String(this.full_tag_open).replace(/classname/g, this.classname) + output + this.full_tag_close;

    return output;
  }

}

module.exports = Pagination;