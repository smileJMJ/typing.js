/* 
 * 키보드 모션 플러그인 시작
 * 호출 형태
	KM({
      eleId: "input_url",
      letter: ["www.google.recruiter.co.kr"],
      letterTime: 0.04,
      letterDelay: 0.07,
      startDelay: 0.3,
      eraseDelay: 0.3,
      infinite: true,
      callback:function(){
      },
      slice: true,
      sliceLetter: "www.#.recruiter.co.kr",
      sliceInsertLetter: ["inAIR", "naver", "daum", "abcdefg"]
    });
*/
var KM = (function(){
	var init = function(option){
		var obj = new Setting(option);
		obj.makeArrLang();		
	};

	var Setting = function(option){
		var $this = this;
		$this.eleId = "";
		$this.letter = "테스트입니다.";
		$this.letterTime = 0;												// 문자열 각각 모션 속도						
		$this.letterDelay = 0;											// 문자열 모션 delay			
		$this.startDelay = 0;												// 문자열 시작 모션 delay
		$this.eraseDelay = 0;														// 지워질 때 delay
		$this.cursorEnd = true;									// 커서 표시 여부
		$this.infinite = false;									// 무한 반복
		$this.slice = false;										// slice 사용 여부
		$this.sliceLetter = "";									// slice할 텍스트는 #로 표시
		$this.sliceInsertLetter = [];						// slice 된 영역에 추가될 텍스트

		$.extend($this, option);

		return $this;
	};

	var fn = Setting.prototype;

	// 문자열 배열 전환 및 언어 체크
	fn.makeArrLang = function(){
		var $this = this,
			eleId = this.eleId,
			str = this.letter,
			resultArr = [];

		if(typeof(str) == "string"){		// letters 문자열 1개일 때
			resultArr[0] = $this.makeArrLangFunc(str);
		}else{								// letters 문자열 여러 개일 때
			for(var i=0; i<str.length; i++){
				resultArr[i] = [];
				resultArr[i] = $this.makeArrLangFunc(str[i]);
			}
		}

		$this.resultArr = resultArr;
		$this.makeMarkup();
	};


	// 문자열 파싱 및 언어 감별
	fn.makeArrLangFunc = function(letter){
		var $this = this,
			str = letter,
			length = str.length,
			strArr = [];

		for(var i=0; i<length; i++){
			strArr[i] = {};
			strArr[i].str = str.substr(i, 1);

			if(/^[a-zA-Z]+$/i.test(strArr[i].str)){				// 문자열이 영어일 때
				strArr[i].lang = "eng";
			}else if(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/i.test(strArr[i].str)){		// 문자열이 한글일 때
				strArr[i].lang = "kor";
				strArr[i].strArr = Hangul.disassemble(strArr[i].str, true);			// 자음, 모음 분리
			}else{
				strArr[i].lang = "";
			}
		}

		return strArr;
	}

	// 마크업 구조 생성
	fn.makeMarkup = function(){
		var $this = this,
			$ele = $("#"+$this.eleId),
			strArr = $this.resultArr,
			cursorBool = $this.cursorEnd,
			html = "";

		strArr.forEach(function(v, i){
			html += "<div class='typing_area'>";
			strArr[i].forEach(function(a, j){
				html += "<span class='letter'>"+a.str+"</span>";
			});

			if(cursorBool){
				html += "<span class='cursor'></span>";
			}
			html += "</div>";
		});

		$ele.html(html);
		$this.typingMotionControl();
	}

	// 모션 컨트롤
	fn.typingMotionControl = function(){
		var $this = this;

		if($this.slice){							// 슬라이스 추가되었을 때
			$this.typingSliceMotion();
		}else{
			$this.typingEraseMotion();
		}
	};

	// 문자 여러개일 때 타이핑 입력 모션
	fn.typingEraseMotion = function(){
		var $this = this,
				$ele = $("#" + $this.eleId),
				$targetTypingArea,
				$letter,
				$cursor;
		var count = $this.resultArr.length,
				curCnt = 0,
				letterLength = 0;				// $targetTypingArea의 .letter length
				i = 0;

		motion();

		function motion(){
			var letterH = 0;

			$targetTypingArea = $ele.find(".typing_area").eq(curCnt);	
			$cursor = $targetTypingArea.find(">span.cursor");
			$letter = $targetTypingArea.find(">span.letter");
			letterLength = $this.resultArr[curCnt].length;

			TweenMax.set($ele.find(".typing_area"), {display:"none"});
			TweenMax.set($targetTypingArea, {display:"block"});

			if($this.cursorEnd){			// 커서 깜빡거림 모션
				TweenMax.set($cursor, {height:$letter.height(), opacity:0});
				TweenMax.to($cursor, 0.3, {opacity:1, repeat:-1, repeatDelay:0.3, yoyo:true, ease:"Quint.easeInOut"});
			}

			for(var i=0; i<letterLength; i++){
				if($letter.eq(i).height() === 0){
					TweenMax.set($letter.eq(i), {height:letterH});
				}else{
					letterH = $letter.eq(i).height();
				}

				TweenMax.to($letter.eq(i), $this.letterTime, {opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*i, onComplete:function(){				// letter 정방향 모션
					if($(this.target).index() === letterLength-1) {
						if(curCnt >= count-1 && $this.infinite === false) return;
						setTimeout(function(){
							for(var j=letterLength-1; j>=0; j--){				// letter 역방향 모션
								if($this.cursorEnd){
									TweenMax.set($cursor, {"left":$letter.eq(j).position().left, "top": $letter.eq(j).position().top, delay:$this.letterDelay*(letterLength-1-j)});
								}
								TweenMax.to($letter.eq(j), $this.letterTime, {opacity:0, ease:"Bounce.easeInOut", delay:$this.letterDelay*(letterLength-1-j)-0.02, onComplete:function(){
									if($(this.target).index() === 0){
										if(curCnt >= count-1){
											if($this.infinite){
												curCnt = 0;
											}else{
												return;
											}
										}else{
											curCnt++;
										}
										setTimeout(function(){
											motion(curCnt);
										}, $this.startDelay*1000);
									}
								}});
							}
						}, $this.eraseDelay*1000);
					}
				}});
				if($this.cursorEnd){
					TweenMax.set($cursor, {"left":$letter.eq(i).position().left + $letter.eq(i).width(), "top":$letter.eq(i).position().top, delay:$this.letterDelay*i});
				}
			}
		}

	};

	// 슬라이스 추가된 타이핑 모션
	fn.typingSliceMotion = function(){
		var $this = this,
				$ele = $("#" + $this.eleId),
				$targetTypingArea = $ele.find(".typing_area"),	
				$cursor = $targetTypingArea.find(">span.cursor"),
				$letter = $targetTypingArea.find(">span.letter");
		var letterLength = $this.resultArr[0].length;				// $targetTypingArea의 .letter length
				sliceLetter = $this.sliceLetter.split("#"),					// #을 제외하고 자른 문자열
				startLength = sliceLetter[0].length,
				endLength = sliceLetter[1].length,
				startPoint = startLength,
				endPoint = letterLength - endLength,
				sliceInsertLetter = $this.sliceInsertLetter,				// 슬라이스된 영역에 들어올 문구들
				curCnt = 0;

		var curTxt = $this.letter[0].split(sliceLetter[0])[1].split(sliceLetter[1])[0];
		sliceInsertLetter.push(curTxt);							// 현재 letter에 저장해둔 주소에서 슬라이스 단어 추출
		
		TweenMax.set($ele.find(".typing_area"), {display:"none"});
		TweenMax.set($targetTypingArea, {display:"block"});
		if($this.cursorEnd){			// 커서 깜빡거림 모션
			TweenMax.to($cursor, 0.3, {opacity:1, repeat:-1, repeatDelay:0.3, yoyo:true, ease:"Quint.easeOut"});
		}

		_fullTextMotion();

		// 처음 모션 실행 시 모든 letter 모션 실행
		function _fullTextMotion(){
			for(var i=0; i<letterLength; i++){
				TweenMax.to($letter.eq(i), $this.letterTime, {opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*i, onComplete:function(){				// letter 정방향 모션
					if($(this.target).index() === letterLength-1) {
						setTimeout(function(){
							for(var j=letterLength-1; j>=endPoint; j--){				// letter 역방향 모션
								if($this.cursorEnd){
									TweenMax.set($cursor, {"left":$letter.eq(j).position().left, delay:$this.letterDelay*(letterLength-1-j)});
								}
							}
							_sliceTextMotion();
						}, $this.eraseDelay*1000);
					}
				}});
				if($this.cursorEnd){
					TweenMax.set($cursor, {"left":$letter.eq(i).position().left + $letter.eq(i).width(), delay:$this.letterDelay*i});
				}
			}
		}

		// 자른 단어 안에서 모션 실행
		function _sliceTextMotion(){
			setTimeout(function(){
				for(var i=endPoint-1; i>=startPoint; i--){
					TweenMax.to($letter.eq(i), $this.letterTime, {opacity:0, ease:"Bounce.easeInOut", delay:$this.letterDelay*(letterLength-1-i)-0.02, onComplete:function(){
						var index = $(this.target).index();
						$(this.target).remove();

						if(index === startPoint){
							var txt = sliceInsertLetter[curCnt];
							var html = "";
							
							for(var j = 0; j<txt.length; j++){
								html += "<span class='letter change' style='display:none;'>"+txt.substr(j, 1)+"</span>";
							}

							$letter.eq(startPoint-1).after(html);
							$letter = $targetTypingArea.find(".letter");
							letterLength = $letter.length;
							endPoint = letterLength - endLength;

							for(var k=0; k<txt.length; k++){
								TweenMax.to($letter.eq(k+startPoint), $this.letterTime, {display:"inline", opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*k, onComplete:function(){
									var $target = $(this.target);
									TweenMax.set($cursor, {"left":$target.position().left + $target.width()});
									if($target.index() === startPoint + txt.length-1){
										if(curCnt === sliceInsertLetter.length - 1){
											curCnt = 0;
										}else{
											curCnt++;
										}
										_sliceTextMotion();
									}
								}});
							}
						}
					}});
					if($this.cursorEnd){
						TweenMax.set($cursor, {"left":$letter.eq(i).position().left, delay:$this.letterDelay*(letterLength-1-i)});
					}
				}
			}, $this.eraseDelay*1000);
		}

	};

	return init;
})();