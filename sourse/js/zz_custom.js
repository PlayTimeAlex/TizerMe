/*
* Ту ду
* Обработка ошибки при запросе тизеров
* Обработка когда не возвращено ниодного тизера
*
* */

(function($) {
    $(document).ready(function(){
        var $tizerContainer,
            tizerContainerW,
            tizerCount,
            tizerWidth,
            $tizers,
            tizers = {},
            defaultTizerLink = 'tizers.php',
            addtext = "Добавить в проект",
            deltext = "Убрать из проекта",
            inProcess = false;


        $tizerContainer = $('#tizer-container');
        tizerContainerW = $tizerContainer.outerWidth(true);
        $tizerPreloader = $('#tizer-preloader');
        $tizerTemplate = $('#tizerTemplate');
        getTizers(addTizers);

        /*
        * Снимает выделение со всего списка в фильтре
        * */
        $('.b-fexpand__l-unselect').click(function(){
            var parent = $(this).closest(".b-fexpand__list");
            $('.b-fexpand__checkbox', parent).prop('checked', false);
        });

        /*
        * Добавляет обводку на блоке поиска при фокусе
        * */
        $('.b-search__field').focus(function(){
            $(this).parent().addClass('focus');
        }).blur(function(){
            $(this).parent().removeClass('focus');
        });

        /*
        * Подсказки для меню пользователя
        * */
        $('.b-umenu__link').tooltip({ position: { my: "center top", at: "center top-28px" } });

        /*
        * Подгрузка тизеров при скроле
        * */
        $(window).scroll(function() {
            if($(window).scrollTop() + $(window).height() + 200 >= $(document).height() && !inProcess) {
                getTizers(addTizers);
            }
        });

        /*
        * Раскрытие расшириного фильтра
        * */
        $('.js-open_filter').click(function(){
            var filter = $('.js-expanded_filter');
            if(filter.hasClass('open')){
                filter.slideUp('fast', function(){
                    filter.removeClass('open');
                });
            } else {
                filter.slideDown('fast', function(){
                    filter.addClass('open');
                });
            }
            return false;
        });

        /*
        *Открытие списка быстрого фильтра
        * */
        $('.b-filter__item').click(function(){
            var dropdown = $('.b-filter__dropdown', this);
            if(dropdown.hasClass('open')){
                dropdown.stop().animate({
                    opacity:0
                }, 300, function(){
                    $(this).removeClass('open').css("display", "none");
                });
            } else {
                $('.b-filter__dropdown').animate({
                    opacity:0
                }, 100, function(){
                    $(this).removeClass('open').css("display", "none");

                    dropdown.css("display", "block").stop().animate({
                        opacity:1
                    }, 300, function(){
                        $(this).addClass('open');
                    });
                });
            }
            return false;
        });

        /*
        * Клик по элементу быстрого фильтра
        *
        * @todo Здесь нужно сделать отправку запроса для получения
        * новых(отфильтрованых) тизеров.
        * */
        $('.b-filter__dropdown-item').click(function(){
            var value = $(this).data('val');
            var parent = $(this).closest('.b-filter__item');
            var text = $(this).html();
            var target = $(".arrow", parent);
            var dropdown = $('.b-filter__dropdown', parent);

            dropdown.stop().animate({
                opacity:0
            }, 300, function(){
                $(this).removeClass('open').css("display", "none");
            });

            $("<a class=\"value\" href=\"#\">"+text+"</a>").insertBefore(target);

            /*
            * в этом месте вставить отправку.
            * getTizers(addTizers, '', true, "","","","get object");
            * Или может вместо объекта с гет параметрам подставлять строку?
            *
            * */

            return false;
        });

        /*
        * Отправка формы расширинего фильтра
        * */
        $("#expanded-filter").submit(function (e) {
            //@todo нужно передать данные фильтра сюда
            getTizers(addTizers, "", true);
            e.preventDefault();
        });

/* -------------------------------Этот участок кода требует замены/переработки. Его можно не трогать пока-----------------------------------*/
          /*
         * Добавление тизера в проект
         *
         * требует доработки. Нужно передавать потом масив
         * тизеров(когда мы выделяем при помощи зажатого ctrl
         * */
        $('.b-tizer').on('click', function(e){
            if(e.ctrlKey === true || e.metaKey === true) {
                var $tizer = $(this);
                if($tizer.hasClass("selected")){
                    $tizer.removeClass('selected');
                    $('.b-tizer__addbtn', this).html(addtext);
                } else {
                    $tizer.addClass('selected');
                    $('.b-tizer__addbtn', this).html(deltext);
                }
                return false;
            }
        });

        /*$('.b-tizer').on({
            mouseenter: function (e) {
                if(e.ctrlKey === false && e.metaKey === false) {
                    $('.b-tizer__hover', this).css('display', 'block').stop().animate({
                        opacity: 1
                    }, 300);
                }

            },
            mouseleave: function () {
                $('.b-tizer__hover', this).stop().animate({
                    opacity:0
                }, 300, function(){
                    $(this).css('display', 'none')
                });
            }
        });*/

        /*
         * Добавление тизера в проект
         *
         * требует доработки. Нужно передавать потом масив
         * тизеров(когда мы выделяем при помощи зажатого ctrl
         * */
        $('.b-tizer__addbtn').on('click', function(){
            var $tizer = $(this).closest('.b-tizer');
            if($tizer.hasClass("selected")){
                $tizer.removeClass('selected');
                $(this).html(addtext);
            } else {
                $tizer.addClass('selected');
                $(this).html(deltext);
            }
            return false;
        });



        $(window).resize(function(){
            //remove details when resize window
            $('.b-tdetalis').stop().slideUp('fast', function(){
                $(this).remove();
            });

            setTizerWidth();
        });

        //temporary
        var detalis = $('.b-tdetalis');
        $('.b-tdetalis').remove();
        $('.b-tizer__detalisbtn').on('click', function(){
            //$('.b-tdetalis').stop().slideDown('fast');
            var parent = $(this);
            if($(this).hasClass('open')){
                $('.b-tdetalis').stop().slideUp('fast', function(){
                    $(this).remove();
                });
                $(this).removeClass('open');
            } else {
                $('.b-tdetalis').stop().slideUp('fast', function(){
                    $(this).remove();
                });
                var afterEl = ".b-tizer:eq("+(tizerCount-1)+")"; //нужно определять текущий ряд. В данный момент коректно работает только в первом ряду.

                detalis.insertAfter(afterEl).stop().slideDown('fast');
                parent.addClass('open');
            }


            return false;
        });

/* ------------------------------------------------------------------*/

        /**
         * Устанавливает ширину тизеров в зависимости от ширины контейнера
         */
        function setTizerWidth(){
            if($tizers.length){
                if(!window.tizerWidth )tizerWidth = parseInt($tizers.css('minWidth'));
                tizerContainerW = $tizerContainer.outerWidth(true);
                tizerCount = Math.floor(tizerContainerW/tizerWidth);
                $tizers.outerWidth(100/tizerCount+"%");
            }
        }

        /**
         * Получает тизеры с выбраного источника и генерирует мапсив с тизерами.
         * Также обновляет переменную со всеми тизерами на странице.
         *
         * @todo сделать обработку ошибок
         * @function вызываеться после успешного получения ответа.
         * @function вызываеться в случае ошибки.
         * @param {boolean} очистить список тизеров или добавить в конец
         * @param {string} ссылка для получения тизеров.
         * @param {number} количество тизеров.
         * @param {number} Начальная позиция.
         * @param {object} дополнительные get параметры.
         *
         */
        function getTizers(done, fail, clean, link, tizers, start, others) {
            if(typeof done == "undefined" || done == "") return false;
            if(typeof fail == "undefined" || fail == "") fail = function(){};
            if(typeof link == "undefined" || link == "") link = defaultTizerLink;
            if(typeof clean == "undefined" || clean == "") clean = false;
            if(typeof tizers == "undefined" || tizers == "") tizers= 20;
            if(typeof start == "undefined" || start == "") start = 0 ;
            if(typeof others == "undefined") {
                others = "";
            } else {
                var otherGet = "";
                for(var key in others) {
                    otherGet += key+"="+others[key];
                }
            };

            var dataArr = [];
            $.ajax({
                url: link+"?tizers="+tizers+"&start="+start,
                dataType: 'json',
                beforeSend: function(){
                    $tizerPreloader.css('opacity', 1);
                    inProcess = true;
                    if(clean) $tizerContainer.html("");
                    console.log(clean);
                },
                success: function(data){
                    for(var key in data) {
                        var obj = {};
                        obj[key] = data[key];
                        tizers[key] = data[key];
                        dataArr.push(data[key]);
                    }
                    done(dataArr);
                },
                error: function(){
                    alert("fail");
                },
                complete:function(){
                    inProcess = false;
                    $tizerPreloader.css('opacity', 0);
                }
            });

        }

        /**
         * Добавляет тизеры на страницу
         *
         * @param {object} Массив с тизерами
         * @param {boolean} очистить список тизеров или добавить в конец
         */
        function addTizers(tizers, clean){
            $tizerContainer.append($tizerTemplate.render(tizers));​

            $tizers = $('.b-tizer');
            setTizerWidth();
        }
    });

    $(window).load(function() {
         
    });
}(jQuery));