<?php 
	$tizers = array();
	isset($_GET['tizers']) ? $tizersCount = $_GET['tizers'] : $tizersCount = 20;
	isset($_GET['start']) ? $start = $_GET['start'] : $start = 0;
	
	for($i = 1+$start; $i <= $tizersCount+$start; $i++) {
		$tizers[$i] = array(
			"id" => $i,
			"name" => "Качественная обувь от производителя Clark Shoes!",
			"image" => "images/content/tizer-image.jpg",
			"description" => "Распродажа качественной обуви от производителя Clark Shoes!",
			"time" => rand(0, 100),
			"frequency" => rand(0, 100),
			"status" => "0",
			"data" => array(
				"Последнее появление:" => "2014-09-01",
				"Страны:" => "Россия,Украина",
				"Время жизни:" => "-",
				"Первое появление:" => "2014-09-01",
				"Города:" => "Москва,Питер,Харьков,Киев",
				"Размер:" => "200x200"
			)
		);
	}
	//var_dump($tizers);
	echo json_encode($tizers);
	
?>